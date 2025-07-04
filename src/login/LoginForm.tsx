import * as React from 'react';
import { Form, useLogin, useNotify, useSafeSetState } from 'ra-core';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';

import { Button } from '../components/ui-kit/Button';
import { Input } from '../components/ui-kit/Input';
import { Spinner } from '../components/ui-kit/Spinner';

export const LoginForm = () => {
    const [loading, setLoading] = useSafeSetState(false);
    const login = useLogin();
    const notify = useNotify();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const submit: SubmitHandler<FieldValues> = async values => {
        setLoading(true);
        try {
            await login(values);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : typeof error === 'string'
                      ? error
                      : 'ra.auth.sign_in_error'; // Default error message
            notify(errorMessage, {
                type: 'error',
                messageArgs: {
                    _: errorMessage,
                },
            });
        }
    };

    return (
        <form
            onSubmit={handleSubmit(submit)}
            className="flex flex-col items-center p-4 space-y-4"
        >
            <div className="w-full max-w-xs">
                <Input
                    {...register('email', { required: 'Email is required' })}
                    type="email"
                    label="Email"
                    autoComplete="email"
                    error={errors.email?.message?.toString()}
                />
            </div>
            <div className="w-full max-w-xs">
                <Input
                    {...register('password', {
                        required: 'Password is required',
                    })}
                    type="password"
                    label="Password"
                    autoComplete="current-password"
                    error={errors.password?.message?.toString()}
                />
            </div>
            <div className="w-full max-w-xs flex flex-col items-center mt-4">
                <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="w-full"
                >
                    {loading ? <Spinner className="w-5 h-5" /> : 'Sign In'}
                </Button>
                <Link
                    to="/forgot-password"
                    className="text-sm text-blue-500 hover:underline mt-2"
                >
                    Forgot your password?
                </Link>
            </div>
        </form>
    );
};

type FieldValues = Record<string, any>;
