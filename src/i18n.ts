import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const saved = (typeof window !== "undefined" && localStorage.getItem("cm_lang")) || "sv";

i18n
  .use(initReactI18next)
  .init({
    lng: saved,
    fallbackLng: "sv",
    supportedLngs: ["sv", "en"],
    interpolation: { escapeValue: false },
    resources: {
      sv: {
        common: {
          loading: "Laddar…",
          nav: {
            home: "Hem",
            movies: "Film",
            games: "Spel",
            books: "Böcker",
            music: "Musik",
            comics: "Serier",
            profile: "Profil"
          },
          sectionNav: {
            overview: "Översikt",
            search: "Sök",
            add: "Lägg till",
            collections: "Samlingar"
          },
          profile: {
            language: {
              title: "Språk",
              help: "Välj appens språk. Ditt val sparas lokalt.",
              sv: "Svenska",
              en: "Engelska"
            }
          }
        }
      },
      en: {
        common: {
          loading: "Loading…",
          nav: {
            home: "Home",
            movies: "Movies",
            games: "Games",
            books: "Books",
            music: "Music",
            comics: "Comics",
            profile: "Profile"
          },
          sectionNav: {
            overview: "Overview",
            search: "Search",
            add: "Add",
            collections: "Collections"
          },
          profile: {
            language: {
              title: "Language",
              help: "Choose the app language. Your choice is stored locally.",
              sv: "Swedish",
              en: "English"
            }
          }
        }
      }
    },
    ns: ["common"],
    defaultNS: "common"
  });

export default i18n;