
import { FluentProvider, webLightTheme, webDarkTheme } from '@fluentui/react-components';
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/routes";
import { useState } from "react";
import { UserProvider } from "./context/userContext";
import { ThemeContext } from "./context/themeContext";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  const customLightTheme = {
    ...webLightTheme,
    borderRadiusNone: '24px',
    borderRadiusSmall: "24px",
    borderRadiusMedium: "24px",
    borderRadiusLarge: "24px",
  };
  const customDarkTheme = {
    ...webDarkTheme,
    borderRadiusNone: '24px',
    borderRadiusSmall: "24px",
    borderRadiusMedium: "24px",
    borderRadiusLarge: "24px",
  };
  const theme = darkMode ? customDarkTheme : customLightTheme;

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
