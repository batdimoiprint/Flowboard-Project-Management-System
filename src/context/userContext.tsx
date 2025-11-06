import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface User {
    id: string;
    userName: string;
    lastName: string;
    firstName: string;
    middleName: string;
    contactNumber: string;
    birthDate: string;
    userIMG: string | null;
    email: string;
    createdAt: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const USER_STORAGE_KEY = 'flowboard_user';

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within UserContext.Provider");
    return ctx;
}

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps): React.JSX.Element {
    const [user, setUserState] = useState<User | null>(() => {
        // Initialize from localStorage on mount
        try {
            const storedUser = localStorage.getItem(USER_STORAGE_KEY);
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error('Failed to parse user from localStorage:', error);
            return null;
        }
    });

    // Sync user to localStorage whenever it changes
    useEffect(() => {
        if (user) {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(USER_STORAGE_KEY);
        }
    }, [user]);

    const setUser = (newUser: User | null) => {
        setUserState(newUser);
    };

    const logout = () => {
        setUserState(null);
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem('token'); // Also remove auth token
    };

    const isAuthenticated = !!user;

    return (
        <UserContext.Provider value={{ user, setUser, logout, isAuthenticated }}>
            {children}
        </UserContext.Provider>
    );
}
