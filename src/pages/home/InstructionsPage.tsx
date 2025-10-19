import { Link } from "react-router-dom";

export default function InstructionsPage() {
  return (
    <section className="p-4 space-y-4">
      <header className="mb-2">
        <h1 className="text-2xl font-semibold">Instruktioner</h1>
        <p className="text-sand-300">
          En snabbguide till <strong>Cinemoria</strong>. All data sparas lokalt i din webbläsare
          (IndexedDB) och appen funkar offline efter första laddningen.
        </p>
      </header>

      {/* Kom igång */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Kom igång</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li>
            Film: gå till <Link to="/movie/add" className="underline">Lägg till film</Link> för att spara din första titel.
          </li>
          <li>
            Böcker: gå till <Link to="/book/add" className="underline">Lägg till bok</Link> och fyll i författare, ISBN m.m.
          </li>
          <li>
            Under <Link to="/profile" className="underline">Profil</Link> kan du exportera/importera backup (JSON).
          </li>
        </ul>
        <div className="flex gap-2 pt-1 flex-wrap">
          <Link to="/movie/add" className="btn btn-primary">+ Ny film</Link>
          <Link to="/book/add" className="btn">+ Ny bok</Link>
          <Link to="/profile" className="btn">Backup</Link>
        </div>
      </article>

      {/* Film – lägga till & redigera */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Filmer: lägga till & redigera</h2>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          <li>Fyll i <em>Titel</em>, valfritt <em>År</em> och <em>Genrer</em>.</li>
          <li>
            Under <em>Ägande</em> kan du markera <span className="chip">Ägd</span>,{" "}
            <span className="chip">Digital</span> och <span className="chip">Önskelista</span>.
          </li>
          <li>
            <em>Utgåva & Teknik</em>: format (UHD/Blu-ray/DVD/VHS/digital), region, videostandard,
            streckkod (EAN/UPC), utgåveår och egna anteckningar.
          </li>
          <li>Tryck <strong>Spara</strong>. Senaste titlar visas på respektive startsida.</li>
        </ol>
        <div className="flex gap-2">
          <Link to="/movie/search" className="btn">Sök film</Link>
          <Link to="/movie/collections" className="btn">Filmsamlingar</Link>
        </div>
      </article>

      {/* Böcker – lägga till & redigera */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Böcker: lägga till & redigera</h2>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          <li>Fyll i <em>Titel</em>, <em>Författare</em>, valfritt <em>År</em> och <em>Genrer</em>.</li>
          <li>
            Markera <span className="chip">Ägd</span> / <span className="chip">Önskelista</span> /{" "}
            <span className="chip">Digital</span> samt ange <em>Format</em> (inbunden/pocket/e-bok/ljudbok).
          </li>
          <li>Valfritt: <em>ISBN</em>, <em>Språk</em>, <em>Sidor</em>, <em>Förlag</em> och egna anteckningar.</li>
          <li>Tryck <strong>Spara</strong>.</li>
        </ol>
        <div className="flex gap-2">
          <Link to="/book/search" className="btn">Sök böcker</Link>
          <Link to="/book/collections" className="btn">Boklistor</Link>
        </div>
      </article>

      {/* Samlingar / Listor */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Samlingar (listor)</h2>
        <p className="text-sand-300">
          Skapa valfria samlingar för film och böcker (t.ex. “Hylla A”, “Favoriter 2025”, “Att köpa”).
          Antalet objekt i varje lista visas direkt. Du kan byta namn eller ta bort listor när som helst.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Link to="/movie/collections" className="btn">Filmsamlingar</Link>
          <Link to="/book/collections" className="btn">Boklistor</Link>
        </div>
      </article>

      {/* Sök & filter */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Sök & filter</h2>
        <p className="text-sand-300">
          I sök kan du filtrera på titel, genrer och andra fält. För film: även streckkod och utgåvedetaljer.
          För böcker: författare, ISBN, språk, format. Resultaten uppdateras live.
        </p>
        <div className="flex gap-2 flex-wrap">
          <Link to="/movie/search" className="btn">Sök film</Link>
          <Link to="/book/search" className="btn">Sök bok</Link>
        </div>
      </article>

      {/* Backup */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Backup & flytta data</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li>
            <strong>Exportera</strong> skapar en JSON med alla <em>filmer</em>, <em>filmsamlingar</em>,
            <em> kopplingar</em>, <em>böcker</em>, <em>boklistor</em> och <em>bok-kopplingar</em>.
          </li>
          <li>
            <strong>Importera</strong> lägger till innehåll från en tidigare export
            (dubbletter undviks inte automatiskt).
          </li>
          <li>
            <strong>Rensa allt</strong> tar bort all lokal data (själva appen ligger kvar).
          </li>
        </ul>
        <Link to="/profile" className="btn">Öppna Profil & Backup</Link>
      </article>

      {/* PWA */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Installera som app (PWA)</h2>
        <p className="text-sand-300">
          På mobiler/surfplattor: öppna webbläsarens meny och välj <em>Installera</em> /
          <em> Lägg till på startskärmen</em>. Då körs Cinemoria helskärm och fungerar offline.
        </p>
      </article>

      {/* Framåt / Spel */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">På gång: Spel</h2>
        <p className="text-sand-300">
          Stödet för spel speglar upplägget för film/bok (hem, sök, lägg till, samlingar, redigera).
          När det är aktiverat dyker samma flöden upp under <em>Spel</em>.
        </p>
      </article>

      {/* FAQ / tekniskt */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">FAQ & tekniskt</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li><strong>Var lagras data?</strong> I webbläsarens IndexedDB på din enhet.</li>
          <li><strong>Synk?</strong> Inte automatisk. Använd export/import mellan enheter.</li>
          <li>
            <strong>Teman?</strong> Byt mellan mörkt, ljust och sepia under{" "}
            <Link to="/profile" className="underline">Profil</Link>.
          </li>
        </ul>
      </article>
    </section>
  );
}