
import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/routes";
import { useState } from "react";
import { UserProvider } from "./context/userContext";
import { ThemeContext } from "./context/themeContext";

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
