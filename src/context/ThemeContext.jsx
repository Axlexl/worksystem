import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

export function ThemeContextProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);
  const toggleDark = () => setDarkMode((v) => !v);
  return (
    <ThemeContext.Provider value={{ darkMode, toggleDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeContext);
}
