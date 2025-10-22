// src/pages/home/InstructionsPage.tsx
import { Link } from "react-router-dom";

export default function InstructionsPage() {
  return (
    <section className="p-4 space-y-4">
      {/* Intro */}
      <header className="mb-2">
        <h1 className="text-2xl font-semibold">Instruktioner</h1>
        <p className="text-sand-300">
          En snabbguide till <strong>Cinemoria</strong>. All data sparas lokalt i
          din webbläsare (IndexedDB). Efter första laddningen fungerar appen
          offline.
        </p>
      </header>

      {/* Kom igång */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Kom igång</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li>
            Film: gå till{" "}
            <Link to="/movie/add" className="underline">
              Lägg till film
            </Link>{" "}
            och spara din första titel.
          </li>
          <li>
            Böcker: gå till{" "}
            <Link to="/book/add" className="underline">
              Lägg till bok
            </Link>{" "}
            och fyll i författare, ISBN m.m.
          </li>
          <li>
            Spel: gå till{" "}
            <Link to="/game/add" className="underline">
              Lägg till spel
            </Link>{" "}
            och ange titel, plattform och status.
          </li>
          <li>
            Under{" "}
            <Link to="/profile" className="underline">
              Profil
            </Link>{" "}
            hittar du Backup (export/import), tema och kameratest.
          </li>
        </ul>
        <div className="flex gap-2 pt-1 flex-wrap">
          <Link to="/movie/add" className="btn btn-primary">+ Ny film</Link>
          <Link to="/book/add" className="btn">+ Ny bok</Link>
          <Link to="/game/add" className="btn">+ Nytt spel</Link>
          <Link to="/profile" className="btn">Backup</Link>
        </div>
      </article>

      {/* Streckkodsläsare */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Streckkod (kamera)</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li>
            <strong>Var du hittar skanning:</strong> I formulären finns fältet{" "}
            <em>Streckkod (EAN/UPC)</em> (film/spel) och <em>ISBN</em> (bok) med knappen{" "}
            <em>Skanna</em>. Tryck <em>Skanna</em> – inte bara på fältet.
          </li>
          <li>
            <strong>Film & spel:</strong> appen sparar EAN/UPC lokalt (för
            igenkänning/anteckning). Ingen extern uppslagning i nuläget.
          </li>
          <li>
            <strong>Böcker:</strong> vid ISBN försöker appen hämta metadata från{" "}
            <a href="https://openlibrary.org/" target="_blank" rel="noreferrer" className="underline">
              Open Library
            </a>{" "}
            (titel, omslag, sidor m.m.). Lyckas det inte lämnas fält orörda.
          </li>
          <li>
            <strong>Kameratest & behörighet:</strong> gå till{" "}
            <Link to="/profile" className="underline">Profil</Link> →{" "}
            <em>Streckkodsskanning</em> → <em>Testa kamera</em> och tillåt kamera.
            Fungerar bäst i Chrome/Edge/Android. Bra ljus hjälper.
          </li>
          <li>
            <strong>Felsök:</strong> Om kameran inte startar, stäng fliken och öppna igen,
            testa först i webbläsare (inte PWA), och kontrollera sajtens kamerabehörigheter.
          </li>
        </ul>
      </article>

      {/* Filmer */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Filmer: lägga till & redigera</h2>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          <li>Fyll i <em>Titel</em>, valfritt <em>År</em> och <em>Genrer</em> (kommaseparerat).</li>
          <li>
            Under <em>Ägande</em> kan du markera{" "}
            <span className="chip">Ägd</span>, <span className="chip">Digital</span>{" "}
            och <span className="chip">Önskelista</span>.
          </li>
          <li>
            <em>Utgåva & Teknik</em>: format (UHD/Blu-ray/DVD/VHS/Digital/Övrigt),
            region, videostandard, streckkod (EAN/UPC), utgåveår, cut, ljudvariant och anteckningar.
          </li>
          <li>Tryck <strong>Spara</strong>. Senaste titlar visas på filmsidan.</li>
        </ol>
        <div className="flex gap-2 flex-wrap">
          <Link to="/movie/search" className="btn">Sök film</Link>
          <Link to="/movie/collections" className="btn">Filmsamlingar</Link>
        </div>
      </article>

      {/* Film-metadata via OMDb */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Film-metadata (OMDb) – egen API-nyckel</h2>
        <p className="text-sand-300">
          Vill du auto-fylla titel/år/affisch/genre från OMDb? Använd din egen
          OMDb-nyckel. Den lagras <em>bara</em> i din webbläsare.
        </p>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          <li>
            Skaffa gratis nyckel på{" "}
            <a
              href="https://www.omdbapi.com/apikey.aspx"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              omdbapi.com/apikey.aspx
            </a>{" "}
            (Free plan räcker).
          </li>
          <li>
            Öppna{" "}
            <Link to="/profile" className="underline">
              Profil
            </Link>{" "}
            → <em>Datakällor & Autofyll</em>:
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li>Bocka i <em>Använd OMDb</em>.</li>
              <li>Klistra in din nyckel i <em>OMDb API-nyckel</em>.</li>
              <li>Tryck <em>Testa OMDb</em> – status ska bli “OK”.</li>
            </ul>
          </li>
          <li>
            Gå till filmformuläret, skriv en titel (ev. år) och tryck{" "}
            <em>Hämta från OMDb</em>.
          </li>
        </ol>
        <p className="text-sand-300 text-sm">
          Obs: OMDb Free har dagliga begränsningar. Misslyckas hämtning visas ett felmeddelande – du kan alltid fylla i själv.
        </p>
      </article>

      {/* Böcker */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Böcker: lägga till & redigera</h2>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          <li>Fyll i <em>Titel</em>, <em>Författare</em>, valfritt <em>År</em> och <em>Genrer</em>.</li>
          <li>
            Markera <span className="chip">Ägd</span> / <span className="chip">Digital</span> /{" "}
            <span className="chip">Önskelista</span> och välj <em>Format</em> (inbunden/pocket/e-bok/ljudbok/övrigt).
          </li>
          <li>
            Extra fält: <em>ISBN</em>, <em>Språk</em>, <em>Sidor</em>, <em>Förlag</em>, omslag och anteckningar.
          </li>
          <li>Tryck <strong>Spara</strong>.</li>
        </ol>
        <div className="flex gap-2 flex-wrap">
          <Link to="/book/search" className="btn">Sök böcker</Link>
          <Link to="/book/collections" className="btn">Boklistor</Link>
        </div>
      </article>

      {/* Bok-metadata via Open Library */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Bok-metadata (Open Library)</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li>
            När du skannar eller skriver ett <strong>ISBN</strong> försöker appen hämta
            titel, år, omslag, språk, sidor och förlag från{" "}
            <a href="https://openlibrary.org/" target="_blank" rel="noreferrer" className="underline">
              Open Library
            </a>.
          </li>
          <li>Ingen API-nyckel krävs. Hittas inget – fyll i manuellt.</li>
        </ul>
      </article>

      {/* Spel */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Spel: lägga till & redigera</h2>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          <li>
            Fyll i <em>Titel</em>, valfritt <em>År</em>, <em>Plattform</em> (PS5, Switch, PC …),
            omslag och <em>Anteckningar</em> (edition/DLC/var spelet ligger).
          </li>
          <li>
            Markera <span className="chip">Ägd</span>, <span className="chip">Digital</span> och/eller{" "}
            <span className="chip">Önskelista</span>.
          </li>
          <li>Tryck <strong>Spara</strong>. Senaste spel visas under Spel → Översikt.</li>
        </ol>
        <div className="flex gap-2 flex-wrap">
          <Link to="/game/search" className="btn">Sök spel</Link>
          <Link to="/game/collections" className="btn">Spellistor</Link>
        </div>
      </article>

      {/* Serier (comics) */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Serier (comics): lägga till & redigera</h2>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          <li>Fyll i <em>Titel</em>, <em>Serie</em>, <em>Volym</em>/<em>Nummer</em> och valfritt <em>År</em>.</li>
          <li>
            Markera <span className="chip">Ägd</span> / <span className="chip">Digital</span> /{" "}
            <span className="chip">Önskelista</span> och välj <em>Format</em> (t.ex. häftad/inbunden/övrigt).
          </li>
          <li>Lägg till omslags-URL och anteckningar (variant, skick, förlag, pris m.m.).</li>
          <li>Tryck <strong>Spara</strong>.</li>
        </ol>
        <div className="flex gap-2 flex-wrap">
          <Link to="/comic/search" className="btn">Sök serier</Link>
          <Link to="/comic/collections" className="btn">Serielistor</Link>
        </div>
      </article>

      {/* Musik */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Musik & album: lägga till & redigera</h2>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          <li>Fyll i <em>Albumtitel</em>, <em>Artist</em>, valfritt <em>År</em> och <em>Genre</em>.</li>
          <li>
            Markera <span className="chip">Ägd</span>, <span className="chip">Digital</span> och/eller{" "}
            <span className="chip">Önskelista</span>.
          </li>
          <li>
            Ange <em>Format</em> (vinyl, CD, kassett, digitalt, Blu-ray Audio, SACD, övrigt) och{" "}
            <em>Anteckningar</em> (utgåva, färgvinyl, press/matrix, skick).
          </li>
          <li>Tryck <strong>Spara</strong>. Senaste album visas under Musik → Översikt.</li>
        </ol>
        <div className="flex gap-2 flex-wrap">
          <Link to="/album/search" className="btn">Sök album</Link>
          <Link to="/album/collections" className="btn">Musiklistor</Link>
        </div>
      </article>

      {/* Samlingar */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Samlingar (listor)</h2>
        <p className="text-sand-300">
          Skapa valfria samlingar för film, böcker, spel, musik och serier (t.ex.
          “Hylla A”, “Favoriter 2025”, “Att köpa”). Antal objekt visas direkt.
          Byter du namn eller tar bort listan ligger innehållet kvar.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Link to="/movie/collections" className="btn">Filmsamlingar</Link>
          <Link to="/book/collections" className="btn">Boklistor</Link>
          <Link to="/game/collections" className="btn">Spellistor</Link>
          <Link to="/album/collections" className="btn">Musiklistor</Link>
          <Link to="/comic/collections" className="btn">Serielistor</Link>
        </div>
      </article>

      {/* Sök & filter */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Sök & filter</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <h3 className="font-medium">Film</h3>
            <p className="text-sand-300 text-sm">
              Fritext på titel, genrer, plats/tjänst, år. Filtrera på Ägd/Digital/Önskelista.
            </p>
            <Link to="/movie/search" className="btn mt-2">Öppna filmsök</Link>
          </div>
          <div>
            <h3 className="font-medium">Böcker</h3>
            <p className="text-sand-300 text-sm">
              Sök på titel, författare, språk, format, ISBN, år. Samma statusfilter som film.
            </p>
            <Link to="/book/search" className="btn mt-2">Öppna boksök</Link>
          </div>
          <div>
            <h3 className="font-medium">Spel</h3>
            <p className="text-sand-300 text-sm">
              Sök på titel, plattform, år och anteckningar. Filtrera på Ägd/Digital/Önskelista.
            </p>
            <Link to="/game/search" className="btn mt-2">Öppna spelsök</Link>
          </div>
        </div>
      </article>

      {/* Backup */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Backup & flytta data</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li>
            <strong>Exportera</strong> skapar en JSON med allt (film/bok/spel/musik/serier och listor/kopplingar).
          </li>
          <li>
            <strong>Importera</strong> lägger till innehåll från en tidigare export
            (dubbletter kan uppstå).
          </li>
          <li><strong>Rensa allt</strong> tar bort all lokal data.</li>
        </ul>
        <Link to="/profile" className="btn">Öppna Profil & Backup</Link>
      </article>

      {/* PWA */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Installera som app (PWA)</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li><strong>Android/Chrome:</strong> Meny → <em>Installera app</em>.</li>
          <li><strong>iPhone/iPad (Safari):</strong> Dela → <em>Lägg till på hemskärmen</em>.</li>
          <li><strong>Desktop:</strong> Ikonen i adressfältet eller webbläsarens meny.</li>
        </ul>
      </article>

      {/* Sekretess & felsökning */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Sekretess, prestanda & felsökning</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li><strong>Sekretess:</strong> Din data lämnar inte enheten. Ingen inloggning, ingen server.</li>
          <li><strong>Synk:</strong> Använd export/import för att flytta mellan enheter.</li>
          <li>
            <strong>OMDb fel?</strong> Kolla <Link to="/profile" className="underline">Profil</Link> →
            “Datakällor & Autofyll”: att det är ibockat, att nyckeln finns och att <em>Testa OMDb</em> visar “OK”.
          </li>
          <li>
            <strong>Om något ser tomt ut:</strong> ladda om sidan, rensa cache, eller exportera → rensa allt → importera igen.
          </li>
          <li>
            <strong>Teman:</strong> Byt mellan mörkt, ljust och sepia under{" "}
            <Link to="/profile" className="underline">Profil</Link>.
          </li>
        </ul>
      </article>

      {/* Feedback */}
      <article className="card p-4 space-y-2">
        <h2 className="font-semibold">Feedback & delning</h2>
        <p className="text-sand-300">
          Under <Link to="/profile" className="underline">Profil</Link> finns
          <em> Skicka feedback</em> (mailto med teknisk info) och <em>Kopiera app-länk</em>.
        </p>
      </article>
    </section>
  );
}