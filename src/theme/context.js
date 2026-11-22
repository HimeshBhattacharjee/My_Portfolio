import { createContext, useContext } from "react";

// Shared theme context. The provider lives in ThemeProvider.jsx; components read it with
// useTheme(). Kept in its own module so React Fast Refresh can hot-reload the provider.
export const ThemeContext = createContext({ theme: "dark", setTheme: () => { }, toggleTheme: () => { } });

export const useTheme = () => useContext(ThemeContext);