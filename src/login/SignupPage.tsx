import {
    Button,
    CircularProgress,
    Container,
    Stack,
    TextField,
    Typography,
    Alert,
    Box,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDataProvider, useLogin, useNotify } from 'react-admin';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Navigate, Link } from 'react-router-dom';
import { CrmDataProvider } from '../providers/types';
import { useConfigurationContext } from '../root/ConfigurationContext';
import { SignUpData, LoginCredentials } from '../types';
import { LoginSkeleton } from './LoginSkeleton';

export const SignupPage = () => {
    const queryClient = useQueryClient();
    const dataProvider = useDataProvider<CrmDataProvider>();
    const { logo, title } = useConfigurationContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const login = useLogin();
    const notify = useNotify();

    const { data: isInitialized, isPending } = useQuery({
        queryKey: ['init'],
        queryFn: async () => {
            try {
                return dataProvider.isInitialized();
            } catch (err) {
                console.warn('Failed to check initialization status:', err);
                return false; // Assume not initialized on error to allow signup
            }
        },
        retry: 2,
        retryDelay: 1000,
    });

    const { isPending: isSignUpPending, mutate, error } = useMutation({
        mutationKey: ['signup'],
        mutationFn: async (data: SignUpData) => {
            return dataProvider.signUp(data);
        },
        onSuccess: data => {
            const credentials: LoginCredentials = {
                email: data.email,
                password: data.password,
                rememberMe: true, // Default to remember for initial setup
            };
            
            login(credentials).then(() => {
                notify('Welcome! Your account has been created successfully.', { type: 'success' });
                // Invalidate auth queries to refresh permissions
                queryClient.invalidateQueries({
                    queryKey: ['auth', 'canAccess'],
                });
            }).catch((loginError) => {
                console.error('Auto-login failed after signup:', loginError);
                notify('Account created successfully. Please log in.', { type: 'success' });
            });
        },
        onError: (error: any) => {
            const errorMessage = error?.message || 'Failed to create account. Please try again.';
            notify(errorMessage, { type: 'error' });
        },
    });

    const {
        register,
        handleSubmit,
        formState: { isValid, errors },
        watch,
    } = useForm<SignUpData>({
        mode: 'onChange',
        defaultValues: {
            first_name: '',
            last_name: '',
            email: '',
            password: '',
        },
    });

    // Watch password for validation
    const password = watch('password');

    if (isPending) {
        return <LoginSkeleton />;
    }

    // For the moment, we only allow one user to sign up. Other users must be created by the administrator.
    if (isInitialized) {
        return <Navigate to="/login" />;
    }

    const onSubmit: SubmitHandler<SignUpData> = async data => {
        mutate(data);
    };

    return (
        <Stack sx={{ height: '100dvh', p: 2 }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
                <img
                    src={logo}
                    alt={title}
                    width={isMobile ? 20 : 24}
                    style={{ filter: 'invert(0.9)' }}
                />
                <Typography component="span" variant={isMobile ? "h6" : "h5"}>
                    {title}
                </Typography>
            </Stack>
            <Stack sx={{ height: '100%' }}>
                <Container
                    maxWidth="xs"
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: 2,
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Typography 
                            variant={isMobile ? "h5" : "h4"} 
                            component="h1" 
                            gutterBottom
                            sx={{ fontWeight: 600 }}
                        >
                            Welcome to ForkFlow CRM
                        </Typography>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            Create the first administrator account to complete the setup.
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error instanceof Error ? error.message : 'An error occurred during signup'}
                        </Alert>
                    )}

                    <Box 
                        component="form" 
                        onSubmit={handleSubmit(onSubmit)}
                        sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                        }}
                    >
                        <Stack direction={isMobile ? "column" : "row"} spacing={2}>
                            <TextField
                                {...register('first_name', { 
                                    required: 'First name is required',
                                    minLength: { value: 2, message: 'First name must be at least 2 characters' }
                                })}
                                label="First name"
                                variant="outlined"
                                fullWidth
                                error={!!errors.first_name}
                                helperText={errors.first_name?.message}
                                inputProps={{
                                    style: { fontSize: isMobile ? '16px' : '14px' }
                                }}
                            />
                            <TextField
                                {...register('last_name', { 
                                    required: 'Last name is required',
                                    minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                                })}
                                label="Last name"
                                variant="outlined"
                                fullWidth
                                error={!!errors.last_name}
                                helperText={errors.last_name?.message}
                                inputProps={{
                                    style: { fontSize: isMobile ? '16px' : '14px' }
                                }}
                            />
                        </Stack>
                        
                        <TextField
                            {...register('email', { 
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Please enter a valid email address'
                                }
                            })}
                            label="Email address"
                            type="email"
                            variant="outlined"
                            fullWidth
                            autoComplete="email"
                            inputMode="email"
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            inputProps={{
                                style: { fontSize: isMobile ? '16px' : '14px' }
                            }}
                        />
                        
                        <TextField
                            {...register('password', { 
                                required: 'Password is required',
                                minLength: { 
                                    value: 8, 
                                    message: 'Password must be at least 8 characters' 
                                },
                                pattern: {
                                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                                    message: 'Password must contain uppercase, lowercase, and number'
                                }
                            })}
                            label="Password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            autoComplete="new-password"
                            error={!!errors.password}
                            helperText={errors.password?.message || 'Minimum 8 characters with uppercase, lowercase, and number'}
                            inputProps={{
                                style: { fontSize: isMobile ? '16px' : '14px' }
                            }}
                        />
                        
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={!isValid || isSignUpPending}
                            fullWidth
                            sx={{ 
                                mt: 2,
                                minHeight: 48,
                                fontSize: '1.1rem',
                                fontWeight: 600,
                            }}
                        >
                            {isSignUpPending ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                'Create Administrator Account'
                            )}
                        </Button>
                        
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            align="center"
                            sx={{ mt: 2 }}
                        >
                            Already have an account?{' '}
                            <Typography
                                component={Link}
                                to="/login"
                                variant="body2"
                                color="primary"
                                sx={{ 
                                    textDecoration: 'none',
                                    '&:hover': { textDecoration: 'underline' }
                                }}
                            >
                                Sign in here
                            </Typography>
                        </Typography>
                    </Box>
                </Container>
            </Stack>
        </Stack>
    );
};

SignupPage.path = '/sign-up';
