import * as React from 'react';
import { styled } from '@mui/material/styles';
import {
    Button,
    CardActions,
    CardContent,
    CircularProgress,
    Typography,
    FormControlLabel,
    Checkbox,
    Alert,
    Box,
} from '@mui/material';
import { Form, useLogin, useNotify, useSafeSetState } from 'ra-core';
import { Login, TextInput } from 'react-admin';
import { SubmitHandler } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { PasswordResetPage } from './PasswordResetPage';
import { LoginCredentials } from '../types';

const PREFIX = 'RaLoginForm';

export const LoginFormClasses = {
    content: `${PREFIX}-content`,
    button: `${PREFIX}-button`,
    icon: `${PREFIX}-icon`,
    rememberMe: `${PREFIX}-rememberMe`,
    errorAlert: `${PREFIX}-errorAlert`,
};

const StyledForm = styled(Form, {
    name: PREFIX,
    overridesResolver: (props, styles) => styles.root,
})(({ theme }) => ({
    [`& .${LoginFormClasses.content}`]: {
        width: 300,
        [theme.breakpoints.down('sm')]: {
            width: '100%',
            maxWidth: 320,
        },
    },
    [`& .${LoginFormClasses.button}`]: {
        marginTop: theme.spacing(2),
        minHeight: 44, // Touch-friendly for mobile
    },
    [`& .${LoginFormClasses.icon}`]: {
        margin: theme.spacing(0.3),
    },
    [`& .${LoginFormClasses.rememberMe}`]: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        '& .MuiCheckbox-root': {
            minHeight: 44, // Touch-friendly checkbox
            minWidth: 44,
        },
    },
    [`& .${LoginFormClasses.errorAlert}`]: {
        marginBottom: theme.spacing(2),
    },
    // Enhanced mobile input styling
    '& .MuiTextField-root': {
        marginBottom: theme.spacing(2),
        '& .MuiInputBase-root': {
            minHeight: 48, // Touch-friendly inputs
            fontSize: '1rem',
            [theme.breakpoints.down('sm')]: {
                fontSize: '16px', // Prevents zoom on iOS
            },
        },
    },
}));

export const LoginForm = () => {
    const [loading, setLoading] = useSafeSetState(false);
    const [rememberMe, setRememberMe] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const login = useLogin();
    const notify = useNotify();

    const submit: SubmitHandler<FieldValues> = values => {
        setLoading(true);
        setError(null);
        
        const credentials: LoginCredentials = {
            email: values.email,
            password: values.password,
            rememberMe: rememberMe,
        };

        login(credentials)
            .then(() => {
                setLoading(false);
                setError(null);
            })
            .catch(error => {
                setLoading(false);
                const errorMessage = typeof error === 'string'
                    ? error
                    : typeof error === 'undefined' || !error.message
                      ? 'Sign in failed. Please check your credentials and try again.'
                      : error.message;
                
                setError(errorMessage);
                notify(errorMessage, {
                    type: 'error',
                    messageArgs: {
                        _: errorMessage,
                    },
                });
            });
    };

    return (
        <Login>
            <StyledForm onSubmit={submit} mode="onChange" noValidate>
                <CardContent className={LoginFormClasses.content}>
                    {error && (
                        <Alert 
                            severity="error" 
                            className={LoginFormClasses.errorAlert}
                            onClose={() => setError(null)}
                        >
                            {error}
                        </Alert>
                    )}
                    
                    <TextInput
                        autoFocus
                        source="email"
                        label="Email"
                        autoComplete="email"
                        inputMode="email"
                        fullWidth
                        variant="outlined"
                    />
                    <TextInput
                        source="password"
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        fullWidth
                        variant="outlined"
                    />

                    <FormControlLabel
                        className={LoginFormClasses.rememberMe}
                        control={
                            <Checkbox
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                color="primary"
                                size="medium"
                            />
                        }
                        label={
                            <Typography variant="body2">
                                Keep me signed in
                            </Typography>
                        }
                    />
                </CardContent>
                <CardActions sx={{ flexDirection: 'column', gap: 1.5, padding: 2 }}>
                    <Button
                        variant="contained"
                        type="submit"
                        color="primary"
                        disabled={loading}
                        fullWidth
                        size="large"
                        className={LoginFormClasses.button}
                    >
                        {loading ? (
                            <CircularProgress
                                className={LoginFormClasses.icon}
                                size={24}
                                thickness={3}
                                color="inherit"
                            />
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                    
                    <Typography
                        component={Link}
                        to={PasswordResetPage.path}
                        variant="body2"
                        color="primary"
                        sx={{
                            textDecoration: 'none',
                            minHeight: 44,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': {
                                textDecoration: 'underline',
                            },
                        }}
                    >
                        Forgot your password?
                    </Typography>
                </CardActions>
            </StyledForm>
        </Login>
    );
};

type FieldValues = Record<string, any>;
