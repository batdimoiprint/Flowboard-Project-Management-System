import { useContext } from 'react';
import { UserContext } from '../context/userContext';

export function useUser() {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within UserContext.Provider");
    return ctx;
}
