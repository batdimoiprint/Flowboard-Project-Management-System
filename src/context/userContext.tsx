import { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../components/apis/auth';
import type { User } from '../components/apis/auth';

// Re-export User type for convenience
export type { User };

interface UserContextType {
    user: User | null;
    token: string | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    isAuthenticated: boolean;
    refreshUser: () => void;
}

const USER_STORAGE_KEY = 'flowboard_user';

const UserContext = createContext<UserContextType | undefined>(undefined);

export { UserContext };

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
    const [user, setUserState] = useState<User | null>(() => {
        // Initialize from localStorage on mount
        return authApi.getCurrentUser();
    });

    const [token, setTokenState] = useState<string | null>(() => {
        // Initialize token from localStorage on mount
        return authApi.getToken();
    });

    // Sync user and token with localStorage changes
    const refreshUser = () => {
        setUserState(authApi.getCurrentUser());
        setTokenState(authApi.getToken());
    };

    const setUser = (newUser: User | null) => {
        setUserState(newUser);
        if (newUser) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        } else {
            localStorage.removeItem(USER_STORAGE_KEY);
        }
    };

    const logout = () => {
        authApi.logout();
        setUserState(null);
        setTokenState(null);
    };

    // Use state-based authentication check instead of authApi
    const isAuthenticated = !!user && !!token;

    return (
        <UserContext.Provider value={{ user, token, setUser, logout, isAuthenticated, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
}
