import { AuthProvider } from 'react-admin';
import { Sale } from '../../types';
import { canAccess } from '../commons/canAccess';
import { createUserService, DEFAULT_USER as SHARED_DEFAULT_USER } from '../commons/userService';

// Use shared DEFAULT_USER from userService to avoid duplication
export const DEFAULT_USER = SHARED_DEFAULT_USER;

export const USER_STORAGE_KEY = 'user';

localStorage.setItem(USER_STORAGE_KEY, JSON.stringify({ ...DEFAULT_USER }));

// UserService will be initialized when dataProvider is available
let userService: ReturnType<typeof createUserService> | null = null;

export const initializeUserService = (dataProvider: any) => {
    userService = createUserService(dataProvider);
};

async function getUser(email: string) {
    if (!userService) {
        console.warn('UserService not initialized, using default user');
        return { ...DEFAULT_USER };
    }

    return userService.getUser(email);
}

export const authProvider: AuthProvider = {
    login: async ({ email }) => {
        const user = await getUser(email);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        return Promise.resolve();
    },
    logout: () => {
        localStorage.removeItem(USER_STORAGE_KEY);
        return Promise.resolve();
    },
    checkError: () => Promise.resolve(),
    checkAuth: () =>
        localStorage.getItem(USER_STORAGE_KEY)
            ? Promise.resolve()
            : Promise.reject(),
    canAccess: async ({ signal, ...params }) => {
        // Get the current user
        const userItem = localStorage.getItem(USER_STORAGE_KEY);
        const localUser = userItem ? (JSON.parse(userItem) as Sale) : null;
        if (!localUser) return false;

        // Compute access rights from the sale role
        const role = localUser.administrator ? 'admin' : 'user';
        return canAccess(role, params);
    },
    getIdentity: () => {
        const userItem = localStorage.getItem(USER_STORAGE_KEY);
        const user = userItem ? (JSON.parse(userItem) as Sale) : null;
        return Promise.resolve({
            id: user?.id ?? 0,
            fullName: user
                ? `${user.first_name} ${user.last_name}`
                : 'Jane Doe',
            avatar: user?.avatar?.src,
        });
    },
};