import { createContext, useContext } from "react";

type ThemeContextType = {
    darkMode: boolean;
    setDarkMode: (checked: boolean) => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme must be used within ThemeContext.Provider");
    return ctx;
}
