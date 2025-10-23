// src/store/languageStore.ts
import { create } from 'zustand';
import i18n from '@/i18n'; // Importera din i18n-instans

type LanguageState = {
  currentLang: 'sv' | 'en';
  setLang: (lang: 'sv' | 'en') => void;
};

// Starta storen med det språk som i18n redan har bestämt
const initialLang = (i18n.language || 'sv').split('-')[0] as 'sv' | 'en';

export const useLanguageStore = create<LanguageState>((set) => ({
  currentLang: initialLang,

  setLang: (lang) => {
    // 1. Byt språk i i18next globalt
    i18n.changeLanguage(lang, (err, t) => {
        if (err) return console.error('i18n load failed', err);
        // 2. När i18next är klar, uppdatera Zustands state
        set({ currentLang: lang }); 
    });
  },
}));

// Lyssna på i18nexts egna event och synka till Zustand.
// Detta är viktigt om språket ändras av webbläsaren/OS.
i18n.on('languageChanged', (lng) => {
    const newLang = (lng || 'sv').split('-')[0] as 'sv' | 'en';
    // Uppdatera storens state utanför Reacts cykel
    useLanguageStore.setState({ currentLang: newLang });
});
