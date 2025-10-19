// src/store/themeStore.ts
import { create } from "zustand";

type Theme = "dark" | "light" | "sepia";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Läs initialt tema
const initialTheme = (localStorage.getItem("cm_theme") as Theme) || "dark";

// Applicera klass direkt vid uppstart (så UI inte blinkar fel tema)
(() => {
  document.documentElement.classList.remove("dark", "sepia");
  if (initialTheme === "dark") document.documentElement.classList.add("dark");
  if (initialTheme === "sepia") document.documentElement.classList.add("sepia");
})();

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    localStorage.setItem("cm_theme", theme);

    // nollställ och lägg till ny klass
    document.documentElement.classList.remove("dark", "sepia");
    if (theme === "dark") document.documentElement.classList.add("dark");
    if (theme === "sepia") document.documentElement.classList.add("sepia");

    set({ theme });
  },
}));