// src/store/themeStore.ts
import { create } from "zustand";

type Theme = "dark" | "light" | "sepia";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: (localStorage.getItem("cm_theme") as Theme) || "dark",
  setTheme: (theme) => {
    // spara temat
    localStorage.setItem("cm_theme", theme);

    // ta bort gamla klasser och lägg till den nya
    document.documentElement.classList.remove("dark", "sepia");
    if (theme === "dark") document.documentElement.classList.add("dark");
    if (theme === "sepia") document.documentElement.classList.add("sepia");

    set({ theme });
  },
}));