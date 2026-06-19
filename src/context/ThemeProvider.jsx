import { useEffect, useState } from "react";
import { ThemeContext } from "./ThemeContext";

const THEME_KEY = "theme";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === "light" || stored === "dark") {
        return stored;
      }
      return "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    // 1) persist to localStorage
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore storage errors
    }

    if (typeof document !== "undefined") {
      const body = document.body;
      const html = document.documentElement;

      // 2) body classes for your existing CSS
      body.classList.remove("theme-light", "theme-dark");
      body.classList.add(`theme-${theme}`);

      // 3) data-theme attribute for new header CSS
      body.setAttribute("data-theme", theme);
      html.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const resetTheme = () => setTheme("dark");

  const value = { theme, setTheme, toggleTheme, resetTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}