import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDataProvider, useLogin, useNotify } from 'react-admin';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Navigate } from 'react-router';
import { CrmDataProvider } from '../providers/types';
import { useConfigurationContext } from '../root/ConfigurationContext';
import { SignUpData } from '../types';
import { Button } from '../components/ui-kit/Button';
import { Input } from '../components/ui-kit/Input';
import { Spinner } from '../components/ui-kit/Spinner';

export const SignupPage = () => {
    const queryClient = useQueryClient();
    const dataProvider = useDataProvider<CrmDataProvider>();
    const { logo, title } = useConfigurationContext();
    const { data: isInitialized, isPending } = useQuery({
        queryKey: ['init'],
        queryFn: async () => {
            return dataProvider.isInitialized();
        },
    });

    const { isPending: isSignUpPending, mutate } = useMutation({
        mutationKey: ['signup'],
        mutationFn: async (data: SignUpData) => {
            return dataProvider.signUp(data);
        },
        onSuccess: data => {
            login({
                email: data.email,
                password: data.password,
                redirectTo: '/contacts',
            }).then(() => {
                notify('Initial user successfully created');
                // FIXME: We should probably provide a hook for that in the ra-core package
                queryClient.invalidateQueries({
                    queryKey: ['auth', 'canAccess'],
                });
            });
        },
        onError: () => {
            notify('An error occurred. Please try again.');
        },
    });

    const login = useLogin();
    const notify = useNotify();

    const {
        register,
        handleSubmit,
        formState: { isValid },
    } = useForm<SignUpData>({
        mode: 'onChange',
    });

    if (isPending) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spinner />
            </div>
        );
    }

    // For the moment, we only allow one user to sign up. Other users must be created by the administrator.
    if (isInitialized) {
        return <Navigate to="/login" />;
    }

    const onSubmit: SubmitHandler<SignUpData> = async data => {
        mutate(data);
    };

    return (
        <div className="flex flex-col h-screen p-4 bg-gray-100">
            <div className="flex items-center space-x-2">
                <img src={logo} alt={title} className="w-6 h-6" />
                <span className="text-xl font-semibold">{title}</span>
            </div>
            <div className="flex-grow flex items-center justify-center">
                <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-2xl font-bold mb-2">Welcome to Atomic CRM</h1>
                    <p className="text-gray-600 mb-6">
                        Create the first user account to complete the setup.
                    </p>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            {...register('first_name', { required: true })}
                            label="First name"
                            required
                        />
                        <Input
                            {...register('last_name', { required: true })}
                            label="Last name"
                            required
                        />
                        <Input
                            {...register('email', { required: true })}
                            label="Email"
                            type="email"
                            required
                        />
                        <Input
                            {...register('password', { required: true })}
                            label="Password"
                            type="password"
                            required
                        />
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={!isValid || isSignUpPending}
                            className="w-full !h-12 text-lg"
                        >
                            {isSignUpPending ? (
                                <Spinner className="w-6 h-6" />
                            ) : (
                                'Create account'
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

SignupPage.path = '/sign-up';
