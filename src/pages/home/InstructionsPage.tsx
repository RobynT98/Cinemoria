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
            för att spara din första titel.
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
            och ange titel, år, plattform och status.
          </li>
          <li>
            Under{" "}
            <Link to="/profile" className="underline">
              Profil
            </Link>{" "}
            kan du exportera/importera backup (JSON) och byta tema.
          </li>
        </ul>
        <div className="flex gap-2 pt-1 flex-wrap">
          <Link to="/movie/add" className="btn btn-primary">
            + Ny film
          </Link>
          <Link to="/book/add" className="btn">
            + Ny bok
          </Link>
          <Link to="/game/add" className="btn">
            + Nytt spel
          </Link>
          <Link to="/profile" className="btn">
            Backup
          </Link>
        </div>
      </article>

      {/* Filmer */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Filmer: lägga till & redigera</h2>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          <li>
            Fyll i <em>Titel</em>, valfritt <em>År</em> och{" "}
            <em>Genrer</em> (kommaseparerat).
          </li>
          <li>
            Under <em>Ägande</em> kan du markera{" "}
            <span className="chip">Ägd</span>,{" "}
            <span className="chip">Digital</span> och{" "}
            <span className="chip">Önskelista</span>.
          </li>
          <li>
            <em>Utgåva &amp; Teknik</em>: format (UHD/Blu-ray/DVD/VHS/Digital),
            region, videostandard, streckkod (EAN/UPC), utgåveår, cut,
            ljudvariant och anteckningar.
          </li>
          <li>
            Tryck <strong>Spara</strong>. Senaste titlar visas på respektive
            startsida.
          </li>
        </ol>
        <div className="flex gap-2 flex-wrap">
          <Link to="/movie/search" className="btn">
            Sök film
          </Link>
          <Link to="/movie/collections" className="btn">
            Filmsamlingar
          </Link>
        </div>
      </article>

      {/* Böcker */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Böcker: lägga till & redigera</h2>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          <li>
            Fyll i <em>Titel</em>, <em>Författare</em>, valfritt <em>År</em>{" "}
            och <em>Genrer</em>.
          </li>
          <li>
            Markera <span className="chip">Ägd</span> /{" "}
            <span className="chip">Digital</span> /{" "}
            <span className="chip">Önskelista</span> och välj{" "}
            <em>Format</em> (inbunden/pocket/e-bok/ljudbok/övrigt).
          </li>
          <li>
            Extra fält: <em>ISBN</em>, <em>Språk</em>, <em>Sidor</em>,{" "}
            <em>Förlag</em>, <em>Anteckningar</em>, omslag.
          </li>
          <li>Tryck <strong>Spara</strong>.</li>
        </ol>
        <div className="flex gap-2 flex-wrap">
          <Link to="/book/search" className="btn">
            Sök böcker
          </Link>
          <Link to="/book/collections" className="btn">
            Boklistor
          </Link>
        </div>
      </article>

      {/* Spel */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Spel: lägga till & redigera</h2>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          <li>
            Fyll i <em>Titel</em>, valfritt <em>År</em>,{" "}
            <em>Plattform</em> (PS5, Switch, PC…), omslag och{" "}
            <em>Anteckningar</em> (edition/DLC/var spelet ligger).
          </li>
          <li>
            Markera <span className="chip">Ägd</span>,{" "}
            <span className="chip">Digital</span> och/eller{" "}
            <span className="chip">Önskelista</span>.
          </li>
          <li>Tryck <strong>Spara</strong>. Senaste spel visas under Spel → Översikt.</li>
        </ol>
        <div className="flex gap-2 flex-wrap">
          <Link to="/game/search" className="btn">
            Sök spel
          </Link>
          <Link to="/game/collections" className="btn">
            Spellistor
          </Link>
        </div>
      </article>

      {/* Samlingar */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Samlingar (listor)</h2>
        <p className="text-sand-300">
          Skapa valfria samlingar för film, böcker och spel (t.ex. “Hylla A”,
          “Favoriter 2025”, “Att köpa”). Antal objekt visas direkt. Du kan byta
          namn eller ta bort listor när som helst – innehållet ligger kvar.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Link to="/movie/collections" className="btn">
            Filmsamlingar
          </Link>
          <Link to="/book/collections" className="btn">
            Boklistor
          </Link>
          <Link to="/game/collections" className="btn">
            Spellistor
          </Link>
        </div>
      </article>

      {/* Sök & filter */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Sök & filter</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <h3 className="font-medium">Film</h3>
            <p className="text-sand-300 text-sm">
              Fritext på titel, genrer, plats/tjänst, år. Filtrera på{" "}
              <em>Ägd</em>/<em>Digital</em>/<em>Önskelista</em>.
            </p>
            <Link to="/movie/search" className="btn mt-2">
              Öppna filmsök
            </Link>
          </div>
          <div>
            <h3 className="font-medium">Böcker</h3>
            <p className="text-sand-300 text-sm">
              Sök på titel, författare, språk, format, ISBN, år. Samma statusfilter
              som film.
            </p>
            <Link to="/book/search" className="btn mt-2">
              Öppna boksök
            </Link>
          </div>
          <div>
            <h3 className="font-medium">Spel</h3>
            <p className="text-sand-300 text-sm">
              Sök på titel, plattform, år och anteckningar. Filtrera på ägd/digital/önskelista.
            </p>
            <Link to="/game/search" className="btn mt-2">
              Öppna spelsök
            </Link>
          </div>
        </div>
      </article>

      {/* Backup */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Backup & flytta data</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li>
            <strong>Exportera</strong> skapar en JSON med filmer, listor och
            kopplingar; böcker, boklistor och kopplingar; samt spel och
            spellistor.
          </li>
          <li>
            <strong>Importera</strong> lägger till innehåll från en tidigare
            export. (Dubbletter kan uppstå om samma objekt finns flera gånger.)
          </li>
          <li>
            <strong>Rensa allt</strong> tar bort all lokal data.
          </li>
        </ul>
        <Link to="/profile" className="btn">
          Öppna Profil &amp; Backup
        </Link>
      </article>

      {/* PWA */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Installera som app (PWA)</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li>
            <strong>Android/Chrome:</strong> Meny → <em>Installera app</em>.
          </li>
          <li>
            <strong>iPhone/iPad (Safari):</strong> Dela →{" "}
            <em>Lägg till på hemskärmen</em>.
          </li>
          <li>
            <strong>Desktop:</strong> Adressfältets installationsikon eller
            webbläsarens meny.
          </li>
        </ul>
      </article>

      {/* Sekretess & felsökning */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Sekretess, prestanda & felsökning</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li>
            <strong>Sekretess:</strong> Din data lämnar inte enheten. Ingen
            inloggning, ingen server.
          </li>
          <li>
            <strong>Synk:</strong> Använd export/import för att flytta mellan
            enheter.
          </li>
          <li>
            <strong>Om något ser tomt ut:</strong> prova att ladda om sidan,
            rensa cache, eller exportera → rensa allt → importera igen.
          </li>
          <li>
            <strong>Teman:</strong> Byt mellan mörkt, ljust och sepia under{" "}
            <Link to="/profile" className="underline">
              Profil
            </Link>
            .
          </li>
        </ul>
      </article>

      {/* Bra att veta */}
      <article className="card p-4 space-y-2">
        <h2 className="font-semibold">Bra att veta</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li>
            Du kan alltid redigera efteråt – inget blir “låst” när du sparar.
          </li>
          <li>
            Listor påverkar inte själva objekten. Tar du bort en lista ligger
            filmer/böcker/spel kvar.
          </li>
          <li>
            Bilder: klistra in valfri URL till omslag/poster – inget laddas upp
            till en server.
          </li>
        </ul>
      </article>
    </section>
  );
}