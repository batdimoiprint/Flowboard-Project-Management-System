import { ToggleButton } from "@fluentui/react-components";
import { WeatherMoon20Filled, WeatherSunny20Filled } from "@fluentui/react-icons";
import { useTheme } from "../../context/themeContext";

export default function ThemeToggle({ className }: { className?: string }) {
    const { darkMode, setDarkMode } = useTheme();
    return (
        <ToggleButton
            className={className}
            checked={darkMode}
            onClick={() => setDarkMode(!darkMode)}
            icon={darkMode ? <WeatherMoon20Filled /> : <WeatherSunny20Filled />}
            aria-label="Toggle dark mode"
        >
            {darkMode ? "Dark Theme" : "Light Theme"}
        </ToggleButton>
    );
}
