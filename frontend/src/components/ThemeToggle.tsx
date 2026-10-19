import {
  FaMoon,
  FaSun,
} from "react-icons/fa";

import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
  const {
    theme,
    toggleTheme,
  } = useTheme();

  const isDark =
    theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      title={
        isDark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
    >
      {isDark ? (
        <FaSun className="text-lg" />
      ) : (
        <FaMoon className="text-lg" />
      )}
    </button>
  );
}

export default ThemeToggle;