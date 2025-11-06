import { tokens, Persona, Button, ToggleButton } from "@fluentui/react-components";
import {
    Person20Filled,
    WeatherMoon20Filled,
    WeatherSunny20Filled,
    SignOut20Filled,
} from "@fluentui/react-icons";

type SidebarProfileActionsProps = {
    darkMode: boolean;
    setDarkMode: (checked: boolean) => void;
};

export default function SidebarProfileActions({ darkMode, setDarkMode }: SidebarProfileActionsProps) {
    return (
        <div style={{ padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}` }}>
            <div style={{ textAlign: 'center', marginBottom: tokens.spacingVerticalL }}>
                <Persona
                    name="John Kenny Reyes"
                    secondaryText="Full Stack Vibe Coder"
                    presence={{ status: 'available' }}
                    size="huge"
                />
            </div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalS, alignItems: 'center', justifyContent: 'center' }}>
                <Button appearance="primary" icon={<Person20Filled />}>
                    My Profile
                </Button>
                <ToggleButton
                    checked={darkMode}
                    onClick={() => setDarkMode(!darkMode)}
                    icon={darkMode ? <WeatherMoon20Filled /> : <WeatherSunny20Filled />}
                    aria-label="Toggle dark mode"
                >
                    Dark Theme
                </ToggleButton>
                <Button appearance="outline" icon={<SignOut20Filled />}>
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
