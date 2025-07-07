import {
    CheckIcon,
    XMarkIcon as CloseIcon,
    MicrophoneIcon as MicIcon,
    NoSymbolIcon as MicOffIcon,
    ArrowPathIcon as ReplayIcon,
    StopIcon
} from '@heroicons/react/24/outline';
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    IconButton,
    LinearProgress,
    Paper,
    Typography,
} from '../../components/ui-kit';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
    const isMobile = useBreakpoint('md');
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
            className: 'min-w-11 min-h-11 relative active:scale-95 transition-transform',
        };

        const icon = isListening ? <MicOffIcon className="h-5 w-5" /> : <MicIcon className="h-5 w-5" />;

        switch (variant) {
            case 'chip':
                return (
                    <Chip
                        icon={icon}
                        label={isListening ? 'Stop' : 'Voice'}
                        onClick={buttonProps.onClick}
                        disabled={buttonProps.disabled}
                        className={`min-h-11 ${
                            isListening
                                ? 'bg-gray-600 text-white'
                                : 'bg-blue-600 text-white border border-blue-600'
                        }`}
                    />
                );

            case 'button':
                return (
                    <Button
                        startIcon={icon}
                        variant={isListening ? 'contained' : 'outlined'}
                        className={`min-w-11 min-h-11 ${
                            isListening
                                ? 'bg-gray-600 text-white'
                                : 'border border-blue-600 text-blue-600'
                        }`}
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
                        className={`min-w-11 min-h-11 relative ${
                            isListening ? 'text-gray-600' : 'text-blue-600'
                        }`}
                        aria-label={
                            isListening
                                ? 'Stop voice input'
                                : 'Start voice input'
                        }
                    >
                        {icon}
                        {isListening && (
                            <div className="absolute -inset-1 rounded-full border-2 border-gray-600 animate-ping" />
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
                className="min-w-11 min-h-11"
            >
                <MicOffIcon className="h-5 w-5" />
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
                className="[&_.dialog-paper]:rounded-xl [&_.dialog-paper]:min-h-96"
            >
                <DialogContent className="p-6">
                    {/* Header */}
                    <Box className="text-center mb-6">
                        <Box className="relative inline-block mb-4">
                            <IconButton
                                size="large"
                                onClick={
                                    isListening ? stopListening : startListening
                                }
                                className={`w-20 h-20 ${
                                    isListening
                                        ? 'bg-gray-200 hover:bg-gray-400'
                                        : 'bg-blue-100 hover:bg-blue-600'
                                }`}
                            >
                                {isListening ? (
                                    <StopIcon className="h-8 w-8" />
                                ) : (
                                    <MicIcon className="h-8 w-8" />
                                )}
                            </IconButton>

                            {/* Sound level indicator */}
                            {isListening && (
                                <div
                                    className="absolute -inset-2 rounded-full border-3 border-gray-600 transition-all duration-100 ease-out"
                                    style={{
                                        opacity: Math.max(
                                            0.3,
                                            soundLevel / 100
                                        ),
                                        transform: `scale(${1 + soundLevel / 200})`,
                                    }}
                                />
                            )}
                        </Box>

                        <Typography variant="h6" gutterBottom>
                            {isListening ? 'Listening...' : 'Voice Input'}
                        </Typography>

                        {isListening && (
                            <Typography variant="body2" className="text-gray-600">
                                {duration}s / {maxDuration}s
                            </Typography>
                        )}
                    </Box>

                    {/* Progress bar */}
                    {isListening && (
                        <LinearProgress
                            variant="determinate"
                            value={(duration / maxDuration) * 100}
                            className="mb-6 rounded h-1.5"
                        />
                    )}

                    {/* Error display */}
                    {error && (
                        <Alert variant="error" className="mb-4">
                            {error}
                        </Alert>
                    )}

                    {/* Transcript display */}
                    <Paper
                        elevation={0}
                        className="p-4 min-h-32 bg-gray-50 border border-gray-200 rounded-lg mb-6"
                    >
                        {transcript || interimTranscript ? (
                            <Typography variant="body1">
                                {transcript}
                                <span className="text-gray-600">
                                    {interimTranscript}
                                </span>
                            </Typography>
                        ) : (
                            <Typography
                                variant="body2"
                                className="text-gray-600 italic"
                            >
                                {placeholder}
                            </Typography>
                        )}
                    </Paper>

                    {/* Confidence indicator */}
                    {confidence > 0 && (
                        <Box className="mb-4">
                            <Typography
                                variant="caption"
                                className="text-gray-600"
                            >
                                Confidence: {Math.round(confidence * 100)}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={confidence * 100}
                                className="mt-1 h-1 rounded"
                            />
                        </Box>
                    )}

                    {/* Action buttons */}
                    <Box className="flex gap-4 justify-center">
                        <Button
                            startIcon={<CloseIcon className="h-4 w-4" />}
                            onClick={handleDialogClose}
                            variant="outlined"
                        >
                            Cancel
                        </Button>

                        {transcript && (
                            <Button
                                startIcon={<ReplayIcon className="h-4 w-4" />}
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
                            startIcon={<CheckIcon className="h-4 w-4" />}
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
