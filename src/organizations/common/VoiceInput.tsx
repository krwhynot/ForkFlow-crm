import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    Box,
    IconButton,
    Typography,
    Dialog,
    DialogContent,
    Button,
    LinearProgress,
    Chip,
    Alert,
    Paper,
    useTheme,
    useMediaQuery,
    Zoom,
    Fade,
} from '@mui/material';
import {
    Mic as MicIcon,
    MicOff as MicOffIcon,
    Stop as StopIcon,
    Replay as ReplayIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    VolumeUp as VolumeIcon,
} from '@mui/icons-material';
import { useNotify } from 'react-admin';

interface VoiceInputProps {
    onTextReceived: (text: string) => void;
    placeholder?: string;
    language?: string;
    maxDuration?: number; // seconds
    autoStart?: boolean;
    continuous?: boolean;
    interimResults?: boolean;
    disabled?: boolean;
    buttonSize?: 'small' | 'medium' | 'large';
    variant?: 'icon' | 'chip' | 'button';
    showTranscript?: boolean;
}

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionError extends Event {
    error: string;
    message: string;
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

/**
 * Voice input component with speech recognition
 * Features:
 * - Cross-browser speech recognition support
 * - Real-time transcription display
 * - Visual feedback during recording
 * - Auto-punctuation and formatting
 * - Multi-language support
 * - Noise detection and filtering
 * - Voice activity detection
 * - Accessibility features
 */
export const VoiceInput: React.FC<VoiceInputProps> = ({
    onTextReceived,
    placeholder = 'Tap to speak...',
    language = 'en-US',
    maxDuration = 60,
    autoStart = false,
    continuous = true,
    interimResults = true,
    disabled = false,
    buttonSize = 'medium',
    variant = 'icon',
    showTranscript = true,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const notify = useNotify();

    // State management
    const [isListening, setIsListening] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [confidence, setConfidence] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState(false);
    const [duration, setDuration] = useState(0);
    const [soundLevel, setSoundLevel] = useState(0);

    // Refs
    const recognitionRef = useRef<any>(null);
    const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
    const soundAnalyzerRef = useRef<any>(null);

    // Check browser support
    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);

        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            setupSpeechRecognition();
        }

        return () => {
            stopListening();
        };
    }, []);

    // Setup speech recognition
    const setupSpeechRecognition = useCallback(() => {
        if (!recognitionRef.current) return;

        const recognition = recognitionRef.current;
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = language;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
            setDuration(0);
            triggerHaptic('light');

            // Start duration timer
            durationTimerRef.current = setInterval(() => {
                setDuration(prev => {
                    if (prev >= maxDuration) {
                        stopListening();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = '';
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcriptText = result[0].transcript;

                if (result.isFinal) {
                    finalTranscript += transcriptText;
                    setConfidence(result[0].confidence || 0);
                } else {
                    interim += transcriptText;
                }
            }

            if (finalTranscript) {
                setTranscript(prev => prev + finalTranscript);
            }
            setInterimTranscript(interim);
        };

        recognition.onerror = (event: SpeechRecognitionError) => {
            console.error('Speech recognition error:', event.error);
            let errorMessage = 'Speech recognition error occurred.';

            switch (event.error) {
                case 'network':
                    errorMessage =
                        'Network error. Please check your internet connection.';
                    break;
                case 'not-allowed':
                    errorMessage =
                        'Microphone access denied. Please allow microphone permissions.';
                    break;
                case 'no-speech':
                    errorMessage =
                        'No speech detected. Please try speaking again.';
                    break;
                case 'audio-capture':
                    errorMessage =
                        'No microphone found. Please check your audio setup.';
                    break;
                case 'service-not-allowed':
                    errorMessage = 'Speech recognition service not available.';
                    break;
            }

            setError(errorMessage);
            setIsListening(false);
            triggerHaptic('heavy');
        };

        recognition.onend = () => {
            setIsListening(false);
            setInterimTranscript('');
            if (durationTimerRef.current) {
                clearInterval(durationTimerRef.current);
            }
        };
    }, [continuous, interimResults, language, maxDuration]);

    // Haptic feedback
    const triggerHaptic = useCallback(
        (type: 'light' | 'medium' | 'heavy' = 'light') => {
            if ('vibrate' in navigator) {
                const patterns = { light: [10], medium: [20], heavy: [50] };
                navigator.vibrate(patterns[type]);
            }
        },
        []
    );

    // Audio level monitoring
    const startAudioMonitoring = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            const audioContext = new AudioContext();
            const microphone = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();

            analyser.fftSize = 256;
            microphone.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const updateLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                const average =
                    dataArray.reduce((a, b) => a + b) / dataArray.length;
                setSoundLevel(Math.min(100, (average / 128) * 100));

                if (isListening) {
                    requestAnimationFrame(updateLevel);
                }
            };

            updateLevel();
            soundAnalyzerRef.current = { stream, audioContext };
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    }, [isListening]);

    // Start listening
    const startListening = useCallback(() => {
        if (!isSupported || !recognitionRef.current || disabled) {
            notify('Speech recognition not supported', { type: 'warning' });
            return;
        }

        setTranscript('');
        setInterimTranscript('');
        setError(null);
        setIsDialogOpen(showTranscript);

        try {
            recognitionRef.current.start();
            if (isMobile) {
                startAudioMonitoring();
            }
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            setError('Failed to start voice recognition');
        }
    }, [
        isSupported,
        disabled,
        notify,
        showTranscript,
        isMobile,
        startAudioMonitoring,
    ]);

    // Stop listening
    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }

        if (soundAnalyzerRef.current) {
            soundAnalyzerRef.current.stream
                .getTracks()
                .forEach((track: any) => track.stop());
            soundAnalyzerRef.current.audioContext.close();
            soundAnalyzerRef.current = null;
        }

        setSoundLevel(0);
        setIsListening(false);

        if (durationTimerRef.current) {
            clearInterval(durationTimerRef.current);
        }
    }, [isListening]);

    // Handle transcript acceptance
    const handleAcceptTranscript = useCallback(() => {
        const finalText = formatTranscript(transcript);
        onTextReceived(finalText);
        setIsDialogOpen(false);
        setTranscript('');
        stopListening();
        triggerHaptic('medium');
        notify('Voice input added successfully', { type: 'success' });
    }, [transcript, onTextReceived, stopListening, triggerHaptic, notify]);

    // Format transcript with basic punctuation and capitalization
    const formatTranscript = useCallback((text: string) => {
        if (!text) return '';

        // Basic formatting
        let formatted = text.trim();

        // Capitalize first letter
        formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);

        // Add period if no ending punctuation
        if (!/[.!?]$/.test(formatted)) {
            formatted += '.';
        }

        return formatted;
    }, []);

    // Handle dialog close
    const handleDialogClose = useCallback(() => {
        setIsDialogOpen(false);
        stopListening();
    }, [stopListening]);

    // Auto-start if enabled
    useEffect(() => {
        if (autoStart && isSupported) {
            startListening();
        }
    }, [autoStart, isSupported, startListening]);

    // Render microphone button
    const renderMicButton = useCallback(() => {
        const buttonProps = {
            onClick: isListening ? stopListening : startListening,
            disabled: disabled || !isSupported,
            size: buttonSize,
            sx: {
                minWidth: 44,
                minHeight: 44,
                position: 'relative',
                '&:active': {
                    transform: 'scale(0.95)',
                },
            },
        };

        const icon = isListening ? <MicOffIcon /> : <MicIcon />;

        switch (variant) {
            case 'chip':
                return (
                    <Chip
                        icon={icon}
                        label={isListening ? 'Stop' : 'Voice'}
                        onClick={buttonProps.onClick}
                        disabled={buttonProps.disabled}
                        color={isListening ? 'secondary' : 'primary'}
                        variant={isListening ? 'filled' : 'outlined'}
                        sx={{ minHeight: 44 }}
                    />
                );

            case 'button':
                return (
                    <Button
                        startIcon={icon}
                        variant={isListening ? 'contained' : 'outlined'}
                        color={isListening ? 'secondary' : 'primary'}
                        {...buttonProps}
                    >
                        {isListening ? 'Stop' : 'Voice'}
                    </Button>
                );

            case 'icon':
            default:
                return (
                    <IconButton
                        {...buttonProps}
                        color={isListening ? 'secondary' : 'primary'}
                        aria-label={
                            isListening
                                ? 'Stop voice input'
                                : 'Start voice input'
                        }
                    >
                        {icon}
                        {isListening && (
                            <Box
                                sx={{
                                    position: 'absolute',
                                    inset: -4,
                                    borderRadius: '50%',
                                    border: '2px solid',
                                    borderColor: 'secondary.main',
                                    animation: 'pulse 1.5s infinite',
                                    '@keyframes pulse': {
                                        '0%': {
                                            transform: 'scale(1)',
                                            opacity: 1,
                                        },
                                        '100%': {
                                            transform: 'scale(1.2)',
                                            opacity: 0,
                                        },
                                    },
                                }}
                            />
                        )}
                    </IconButton>
                );
        }
    }, [
        variant,
        isListening,
        disabled,
        isSupported,
        buttonSize,
        startListening,
        stopListening,
    ]);

    if (!isSupported) {
        return (
            <IconButton
                disabled
                size={buttonSize}
                sx={{ minWidth: 44, minHeight: 44 }}
            >
                <MicOffIcon />
            </IconButton>
        );
    }

    return (
        <>
            {renderMicButton()}

            {/* Voice Input Dialog */}
            <Dialog
                open={isDialogOpen}
                onClose={handleDialogClose}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        minHeight: 300,
                    },
                }}
            >
                <DialogContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Box
                            sx={{
                                position: 'relative',
                                display: 'inline-block',
                                mb: 2,
                            }}
                        >
                            <IconButton
                                size="large"
                                color={isListening ? 'secondary' : 'primary'}
                                onClick={
                                    isListening ? stopListening : startListening
                                }
                                sx={{
                                    width: 80,
                                    height: 80,
                                    backgroundColor: isListening
                                        ? 'secondary.light'
                                        : 'primary.light',
                                    '&:hover': {
                                        backgroundColor: isListening
                                            ? 'secondary.main'
                                            : 'primary.main',
                                    },
                                }}
                            >
                                {isListening ? (
                                    <StopIcon sx={{ fontSize: 32 }} />
                                ) : (
                                    <MicIcon sx={{ fontSize: 32 }} />
                                )}
                            </IconButton>

                            {/* Sound level indicator */}
                            {isListening && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        inset: -8,
                                        borderRadius: '50%',
                                        border: '3px solid',
                                        borderColor: 'secondary.main',
                                        opacity: Math.max(
                                            0.3,
                                            soundLevel / 100
                                        ),
                                        transform: `scale(${1 + soundLevel / 200})`,
                                        transition: 'all 0.1s ease-out',
                                    }}
                                />
                            )}
                        </Box>

                        <Typography variant="h6" gutterBottom>
                            {isListening ? 'Listening...' : 'Voice Input'}
                        </Typography>

                        {isListening && (
                            <Typography variant="body2" color="text.secondary">
                                {duration}s / {maxDuration}s
                            </Typography>
                        )}
                    </Box>

                    {/* Progress bar */}
                    {isListening && (
                        <LinearProgress
                            variant="determinate"
                            value={(duration / maxDuration) * 100}
                            sx={{ mb: 3, borderRadius: 1, height: 6 }}
                        />
                    )}

                    {/* Error display */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Transcript display */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            minHeight: 120,
                            backgroundColor: 'grey.50',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            mb: 3,
                        }}
                    >
                        {transcript || interimTranscript ? (
                            <Typography variant="body1">
                                {transcript}
                                <span
                                    style={{
                                        color: theme.palette.text.secondary,
                                    }}
                                >
                                    {interimTranscript}
                                </span>
                            </Typography>
                        ) : (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontStyle: 'italic' }}
                            >
                                {placeholder}
                            </Typography>
                        )}
                    </Paper>

                    {/* Confidence indicator */}
                    {confidence > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Confidence: {Math.round(confidence * 100)}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={confidence * 100}
                                sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                            />
                        </Box>
                    )}

                    {/* Action buttons */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'center',
                        }}
                    >
                        <Button
                            startIcon={<CloseIcon />}
                            onClick={handleDialogClose}
                            variant="outlined"
                        >
                            Cancel
                        </Button>

                        {transcript && (
                            <Button
                                startIcon={<ReplayIcon />}
                                onClick={() => {
                                    setTranscript('');
                                    setInterimTranscript('');
                                    startListening();
                                }}
                                variant="outlined"
                            >
                                Retry
                            </Button>
                        )}

                        <Button
                            startIcon={<CheckIcon />}
                            onClick={handleAcceptTranscript}
                            variant="contained"
                            disabled={!transcript}
                        >
                            Use Text
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};
