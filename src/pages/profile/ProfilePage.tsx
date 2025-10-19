// src/pages/InstructionsPage.tsx
import { Link } from "react-router-dom";

export default function InstructionsPage() {
  return (
    <section className="p-4 space-y-4">
      <header className="mb-2">
        <h1 className="text-2xl font-semibold">Instruktioner</h1>
        <p className="text-sand-300">
          En snabbguide till <strong>Cinemoria</strong>. All data sparas lokalt (IndexedDB)
          och appen funkar offline efter första laddningen.
        </p>
      </header>

      {/* Kom igång */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Kom igång</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li>Tryck <Link to="/movie/add" className="underline">Lägg till film</Link> för att spara din första titel.</li>
          <li>Skapa <Link to="/movie/collections" className="underline">filmsamlingar</Link> (t.ex. Hylla A, Favoriter).</li>
          <li>Motsvarande finns för <Link to="/book" className="underline">böcker</Link> och <Link to="/game" className="underline">spel</Link>.</li>
          <li>Under <Link to="/profile" className="underline">Profil</Link> kan du exportera/importera backup (JSON) och byta tema.</li>
        </ul>
        <div className="flex gap-2 pt-1 flex-wrap">
          <Link to="/movie/add" className="btn btn-primary">+ Ny film</Link>
          <Link to="/book/add" className="btn">+ Ny bok</Link>
          <Link to="/game/add" className="btn">+ Nytt spel</Link>
        </div>
      </article>

      {/* Lägga till & redigera */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Lägga till & redigera</h2>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          <li>Fyll i titel, valfritt år och genrer.</li>
          <li>Markera <span className="chip">Ägd</span>, <span className="chip">Digital</span> eller <span className="chip">Önskelista</span>.</li>
          <li>För film: format (UHD/Blu-ray/DVD), region, videostandard m.m.</li>
          <li>Spara. Senaste poster syns på respektive startsida.</li>
        </ol>
      </article>

      {/* Listor */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Samlingar (listor)</h2>
        <p className="text-sand-300">
          Skapa valfria listor: “Hylla B”, “Att köpa”, “Halloween”. Antalet objekt visas direkt.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Link to="/movie/collections" className="btn">Film-listor</Link>
          <Link to="/book/collections" className="btn">Bok-listor</Link>
          <Link to="/game/collections" className="btn">Spel-listor</Link>
        </div>
      </article>

      {/* Sök & filter */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Sök & filter</h2>
        <p className="text-sand-300">
          Hitta via titel, genrer, och metadata. Filtrera på ägd/digital/önskelista
          och (för film) format.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Link to="/movie/search" className="btn">Sök film</Link>
          <Link to="/book/search" className="btn">Sök bok</Link>
          <Link to="/game/search" className="btn">Sök spel</Link>
        </div>
      </article>

      {/* Backup */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Backup & flytta data</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li><strong>Exportera</strong> skapar en JSON med alla filmer/böcker/spel och listkopplingar.</li>
          <li><strong>Importera</strong> lägger till innehållet från en tidigare export (dubbletter kan uppstå).</li>
          <li><strong>Rensa allt</strong> tar bort lokal data (appen ligger kvar).</li>
        </ul>
        <Link to="/profile" className="btn">Öppna Profil</Link>
      </article>

      {/* PWA */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Installera som app (PWA)</h2>
        <p className="text-sand-300">
          I stödda webbläsare: välj <em>Installera</em> / <em>Lägg till på startskärmen</em>.
          Då körs Cinemoria helskärm och fungerar offline.
        </p>
      </article>
    </section>
  );
}