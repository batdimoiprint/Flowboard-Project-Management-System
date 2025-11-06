
import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/routes";
import { createContext, useContext, useState } from "react";
import { UserProvider } from "./context/userContext";

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

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const theme = darkMode ? webDarkTheme : webLightTheme;

  return (
    <UserProvider>
      <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
        <FluentProvider theme={theme}>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </FluentProvider>
      </ThemeContext.Provider>
    </UserProvider>
  );
}
