import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext =
  createContext<ThemeContextType | undefined>(
    undefined
  );

const THEME_KEY =
  "journal-reviewer-theme";

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setTheme] =
    useState<Theme>(() => {
      const savedTheme =
        localStorage.getItem(THEME_KEY);

      if (
        savedTheme === "light" ||
        savedTheme === "dark"
      ) {
        return savedTheme;
      }

      return "dark";
    });

  useEffect(() => {
    const html =
      document.documentElement;

    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }

    localStorage.setItem(
      THEME_KEY,
      theme
    );
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark"
        ? "light"
        : "dark"
    );
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeProvider"
    );
  }

  return context;
}