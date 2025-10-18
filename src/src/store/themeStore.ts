import { create } from "zustand";

type Theme = "dark" | "light" | "sepia";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: (localStorage.getItem("cm_theme") as Theme) || "dark",
  setTheme: (theme) => {
    localStorage.setItem("cm_theme", theme);
    document.documentElement.classList.remove("dark", "light", "sepia");
    document.documentElement.classList.add(theme);
    set({ theme });
  },
}));

// Kör detta direkt vid import för att applicera temat på sidladdning
const saved = (localStorage.getItem("cm_theme") as Theme) || "dark";
document.documentElement.classList.add(saved);