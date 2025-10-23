// src/pages/home/InstructionsPage.tsx
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function InstructionsPage() {
  const { t } = useTranslation();

  // Funktion för att hantera i18n-nycklar som är listor (steg)
  const getSteps = (key: string) => {
    // Använder returnObjects: true för att få tillbaka en array av strängar från JSON
    const steps = t(key, { returnObjects: true }) as string[] | unknown;
    return Array.isArray(steps) ? steps : [];
  };

  const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <article className="card p-4 space-y-3 dark:bg-ink-800/50">
      <h2 className="font-semibold">{title}</h2>
      {children}
    </article>
  );

  return (
    <section className="p-4 space-y-6">
      {/* Intro */}
      <header className="mb-2">
        <h1 className="text-2xl font-semibold">{t("instructions.title", "Instruktioner")}</h1>
        <p className="text-sand-300">
          {t("instructions.intro", "En snabbguide till Cinemoria...")}
        </p>
      </header>

      {/* Kom igång */}
      <Card title={t("instructions.getStarted.title", "Kom igång")}>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li>{t("instructions.getStarted.movie", "Film: gå till Lägg till film...")}</li>
          <li>{t("instructions.getStarted.book", "Böcker: gå till Lägg till bok...")}</li>
          <li>{t("instructions.getStarted.game", "Spel: gå till Lägg till spel...")}</li>
          <li>{t("instructions.getStarted.music", "Musik: gå till Lägg till musik...")}</li>
          <li>{t("instructions.getStarted.comic", "Serier: gå till Lägg till en serietidning...")}</li>
          <li>{t("instructions.getStarted.profile", "Under Profil hittar du Backup...")}</li>
        </ul>
        <div className="flex gap-2 pt-1 flex-wrap">
          <Link to="/movie/add" className="btn btn-primary">{t("instructions.getStarted.cta_movie", "+ Ny film")}</Link>
          <Link to="/book/add" className="btn">{t("instructions.getStarted.cta_book", "+ Ny bok")}</Link>
          <Link to="/game/add" className="btn">{t("instructions.getStarted.cta_game", "+ Nytt spel")}</Link>
          <Link to="/album/add" className="btn">{t("instructions.getStarted.cta_album", "+ Ny skiva")}</Link>
          <Link to="/comic/add" className="btn">{t("instructions.getStarted.cta_comic", "+ Ny serietidning")}</Link>
          <Link to="/profile" className="btn">{t("instructions.getStarted.cta_profile", "Backup")}</Link>
        </div>
      </Card>

      {/* Streckkodsläsare */}
      <Card title={t("instructions.barcode.title", "Streckkod (kamera)")}>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li><strong>{t("instructions.barcode.where", "Var du hittar skanning...")}</strong></li>
          <li>{t("instructions.barcode.note", "Film & spel & Serier & Musik...")}</li>
          <li>{t("instructions.barcode.books", "Böcker: vid ISBN försöker appen hämta metadata...")}</li>
          <li>{t("instructions.barcode.perm", "Kameratest & behörighet: gå till Profil...")}</li>
          <li>{t("instructions.barcode.troubleshoot", "Felsök: Om kameran inte startar...")}</li>
        </ul>
      </Card>

      {/* Filmer */}
      <Card title={t("instructions.movies.title", "Filmer: lägga till & redigera")}>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          {getSteps("instructions.movies.steps").map((step, i) => <li key={i}>{step}</li>)}
        </ol>
        <div className="flex gap-2 flex-wrap">
          <Link to="/movie/search" className="btn">{t("instructions.movies.cta_search", "Sök film")}</Link>
          <Link to="/movie/collections" className="btn">{t("instructions.movies.cta_lists", "Filmsamlingar")}</Link>
        </div>
      </Card>

      {/* Film-metadata via OMDb */}
      <Card title={t("instructions.omdb.title", "Film-metadata (OMDb) – egen API-nyckel")}>
        <p className="text-sand-300">
          {t("instructions.omdb.lead", "Vill du auto-fylla titel/år/affisch/genre från OMDb?...")}
        </p>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          {getSteps("instructions.omdb.steps").map((step, i) => <li key={i}>{step}</li>)}
        </ol>
        <p className="text-sand-300 text-sm mt-3">
          {t("instructions.omdb.note", "Obs: OMDb Free har dagliga begränsningar...")}
        </p>
      </Card>

      {/* Böcker */}
      <Card title={t("instructions.books.title", "Böcker: lägga till & redigera")}>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          {getSteps("instructions.books.steps").map((step, i) => <li key={i}>{step}</li>)}
        </ol>
        <div className="flex gap-2 flex-wrap">
          <Link to="/book/search" className="btn">{t("instructions.books.cta_search", "Sök böcker")}</Link>
          <Link to="/book/collections" className="btn">{t("instructions.books.cta_lists", "Boklistor")}</Link>
        </div>
      </Card>

      {/* Spel */}
      <Card title={t("instructions.games.title", "Spel: lägga till & redigera")}>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          {getSteps("instructions.games.steps").map((step, i) => <li key={i}>{step}</li>)}
        </ol>
        <div className="flex gap-2 flex-wrap">
          <Link to="/game/search" className="btn">{t("instructions.games.cta_search", "Sök spel")}</Link>
          <Link to="/game/collections" className="btn">{t("instructions.games.cta_lists", "Spellistor")}</Link>
        </div>
      </Card>

      {/* Serier (comics) */}
      <Card title={t("instructions.comics.title", "Serier (comics): lägga till & redigera")}>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          {getSteps("instructions.comics.steps").map((step, i) => <li key={i}>{step}</li>)}
        </ol>
        <div className="flex gap-2 flex-wrap">
          <Link to="/comic/search" className="btn">{t("instructions.comics.cta_search", "Sök serier")}</Link>
          <Link to="/comic/collections" className="btn">{t("instructions.comics.cta_lists", "Serielistor")}</Link>
        </div>
      </Card>

      {/* Musik */}
      <Card title={t("instructions.music.title", "Musik & album: lägga till & redigera")}>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          {getSteps("instructions.music.steps").map((step, i) => <li key={i}>{step}</li>)}
        </ol>
        <div className="flex gap-2 flex-wrap">
          <Link to="/album/search" className="btn">{t("instructions.music.cta_search", "Sök album")}</Link>
          <Link to="/album/collections" className="btn">{t("instructions.music.cta_lists", "Musiklistor")}</Link>
        </div>
      </Card>

      {/* Samlingar */}
      <Card title={t("instructions.collections.title", "Samlingar (listor)")}>
        <p className="text-sand-300">{t("instructions.collections.text", "Skapa valfria samlingar...")}</p>
        <div className="flex gap-2 flex-wrap">
          <Link to="/movie/collections" className="btn">{t("instructions.collections.cta_movies", "Filmsamlingar")}</Link>
          <Link to="/book/collections" className="btn">{t("instructions.collections.cta_books", "Boklistor")}</Link>
          <Link to="/game/collections" className="btn">{t("instructions.collections.cta_games", "Spellistor")}</Link>
          <Link to="/album/collections" className="btn">{t("instructions.collections.cta_albums", "Musiklistor")}</Link>
          <Link to="/comic/collections" className="btn">{t("instructions.collections.cta_comics", "Serielistor")}</Link>
        </div>
      </Card>

      {/* Sök & filter */}
      <Card title={t("instructions.searchFilter.title", "Sök & filter")}>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <h3 className="font-medium">{t("home.stats.movies", "Filmer")}</h3>
            <p className="text-sand-300 text-sm">{t("instructions.searchFilter.movies", "Fritext på titel...")}</p>
            <Link to="/movie/search" className="btn mt-2">{t("instructions.searchFilter.open_movies", "Öppna filmsök")}</Link>
          </div>
          {/* Fler sektioner kan läggas till här */}
          
          {/* Dessa bör vara i en loop eller separat block för att spara utrymme */}
          {/* Här är böcker, spel, musik och serier */}
          
          <div>
            <h3 className="font-medium">{t("home.stats.books", "Böcker")}</h3>
            <p className="text-sand-300 text-sm">{t("instructions.searchFilter.books", "Sök på titel, författare...")}</p>
            <Link to="/book/search" className="btn mt-2">{t("instructions.searchFilter.open_books", "Öppna boksök")}</Link>
          </div>

          <div>
            <h3 className="font-medium">{t("home.stats.games", "Spel")}</h3>
            <p className="text-sand-300 text-sm">{t("instructions.searchFilter.games", "Sök på titel, plattform...")}</p>
            <Link to="/game/search" className="btn mt-2">{t("instructions.searchFilter.open_games", "Öppna spelsök")}</Link>
          </div>
          
          <div>
            <h3 className="font-medium">{t("home.stats.albums", "Musik")}</h3>
            <p className="text-sand-300 text-sm">{t("instructions.searchFilter.music", "Sök på albumtitel, artist...")}</p>
            <Link to="/album/search" className="btn mt-2">{t("instructions.searchFilter.open_albums", "Öppna musiksök")}</Link>
          </div>

          <div>
            <h3 className="font-medium">{t("home.stats.comics", "Serier")}</h3>
            <p className="text-sand-300 text-sm">{t("instructions.searchFilter.comics", "Sök på titel, volym, nummer...")}</p>
            <Link to="/comic/search" className="btn mt-2">{t("instructions.searchFilter.open_comics", "Öppna seriesök")}</Link>
          </div>
        </div>
      </Card>

      {/* Backup */}
      <Card title={t("instructions.backup.title", "Backup & flytta data")}>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li>{t("instructions.backup.export", "Exportera skapar en JSON...")}</li>
          <li>{t("instructions.backup.import", "Importera lägger till innehåll...")}</li>
          <li>{t("instructions.backup.wipe", "Rensa allt tar bort all lokal data.")}</li>
        </ul>
        <Link to="/profile" className="btn mt-4">{t("instructions.backup.cta", "Öppna Profil & Backup")}</Link>
      </Card>

      {/* PWA */}
      <Card title={t("instructions.pwa.title", "Installera som app (PWA)")}>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li>{t("instructions.pwa.android", "Android/Chrome: Meny → Installera app.")}</li>
          <li>{t("instructions.pwa.ios", "iPhone/iPad (Safari): Dela → Lägg till på hemskärmen.")}</li>
          <li>{t("instructions.pwa.desktop", "Desktop: Ikonen i adressfältet eller webbläsarens meny.")}</li>
        </ul>
      </Card>

      {/* Sekretess & felsökning */}
      <Card title={t("instructions.privacy.title", "Sekretess, prestanda & felsökning")}>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li><strong>{t("instructions.privacy.privacy", "Sekretess: Din data lämnar inte enheten.")}</strong></li>
          <li>{t("instructions.privacy.sync", "Synk: Använd export/import för att flytta mellan enheter.")}</li>
          <li>{t("instructions.privacy.omdb", "OMDb fel? Kolla Profil → “Datakällor & Autofyll”...")}</li>
          <li>{t("instructions.privacy.empty", "Om något ser tomt ut: ladda om sidan...")}</li>
          <li>{t("instructions.privacy.themes", "Teman: Byt mellan mörkt, ljust och sepia under Profil.")}</li>
        </ul>
      </Card>
    </section>
  );
}
