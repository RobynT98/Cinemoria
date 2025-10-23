// src/store/languageStore.ts
import { create } from 'zustand';
import i18n from '@/i18n'; // Se till att sökvägen till din i18n-fil är korrekt

type LanguageState = {
  currentLang: 'sv' | 'en';
  setLang: (lang: 'sv' | 'en') => void;
};

// Starta storen med det språk som i18n redan har bestämt
const initialLang = (i18n.language || 'sv').split('-')[0] as 'sv' | 'en';

export const useLanguageStore = create<LanguageState>((set) => ({
  currentLang: initialLang,

  setLang: (lang) => {
    // 1. Uppdatera i18next (denna laddar nya JSON-filer)
    i18n.changeLanguage(lang, (err) => {
        if (err) return console.error('i18n load failed', err);
        // 2. När i18next är klar, uppdatera Zustands state
        set({ currentLang: lang }); 
    });
  },
}));

// VIKTIGT: Lyssna på i18nexts egna event och synka till Zustand.
// Detta säkerställer att Zustands state är korrekt även om något externt
// skulle byta språk (t.ex. webbläsarens Language Detector).
i18n.on('languageChanged', (lng) => {
    const newLang = (lng || 'sv').split('-')[0] as 'sv' | 'en';
    // Uppdatera storens state utanför Reacts cykel
    useLanguageStore.setState({ currentLang: newLang });
});
