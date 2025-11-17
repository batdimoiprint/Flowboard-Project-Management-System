import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../components/apis/auth';
import { usersApi } from '../components/apis/users';
import type { User } from '../components/apis/auth';

// Re-export User type for convenience
export type { User };

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    isAuthenticated: boolean;
    refreshUser: () => Promise<void>;
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

    // On mount, try to refresh user from server if cookie session exists
    useEffect(() => {
        // We don't await here; refreshUser handles fallback and state.
        void refreshUser();
    // We intentionally do not include refreshUser in the dependency array since its
    // identity is stable (declared inside the component) and this should only run once.
    }, []);

    // Token is managed by the backend HttpOnly cookie. We do not store token in JS.

    // Sync user with server/localStorage. We attempt to refresh from the server
    // (which requires the HttpOnly cookie to be present) and fallback to the
    // locally stored user if server call fails.
    const refreshUser = async () => {
        try {
            const currentUser = await usersApi.getCurrentUser();
            setUserState(currentUser);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
        } catch {
            // If the server check fails, fallback to localStorage (may be stale).
            setUserState(authApi.getCurrentUser());
        }
    };

    const setUser = (newUser: User | null) => {
        setUserState(newUser);
        if (newUser) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
        } else {
            localStorage.removeItem(USER_STORAGE_KEY);
        }
    };

    const logout = async () => {
        await authApi.logout();
        setUserState(null);
    };

    // Use state-based authentication check instead of authApi
    const isAuthenticated = !!user;

    return (
        <UserContext.Provider value={{ user, setUser, logout, isAuthenticated, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
}
