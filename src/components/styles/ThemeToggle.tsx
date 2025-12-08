import { ToggleButton } from "@fluentui/react-components";
import { useEffect } from "react";
import { WeatherMoon20Filled, WeatherSunny20Filled } from "@fluentui/react-icons";
import { useTheme } from "../../context/themeContext";

export default function ThemeToggle({ className }: { className?: string }) {
    const { darkMode, setDarkMode } = useTheme();
    // Persist theme to localStorage
    const handleToggle = () => {
        localStorage.setItem('darkMode', String(!darkMode));
        setDarkMode(!darkMode);
    };

    // Initialize theme from localStorage on mount
    useEffect(() => {   
        const stored = localStorage.getItem('darkMode');
        if (stored !== null) {
            setDarkMode(stored === 'true');
        }
    }, [setDarkMode]);

    return (
        <ToggleButton
            className={className}
            checked={darkMode}
            onClick={handleToggle}
            icon={darkMode ? <WeatherMoon20Filled /> : <WeatherSunny20Filled />}
            aria-label="Toggle dark mode"
        >
            {darkMode ? "Dark Theme" : "Light Theme"}
        </ToggleButton>
    );
}
