import { Link } from "react-router-dom";

export default function InstructionsPage() {
  return (
    <section className="p-4 space-y-4">
      <header className="mb-2">
        <h1 className="text-2xl font-semibold">Instruktioner</h1>
        <p className="text-sand-300">
          En snabbguide till hur du använder <strong>Cinemoria</strong>. All
          data sparas lokalt i din webbläsare (IndexedDB) och appen funkar
          offline efter första laddningen.
        </p>
      </header>

      {/* Kom igång */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Kom igång</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li>Tryck <Link to="/add" className="underline">Lägg till</Link> för att spara din första film.</li>
          <li>Skapa <Link to="/collections" className="underline">samlingar</Link> (t.ex. Hylla A, Favoriter 2025).</li>
          <li>Under <Link to="/profile" className="underline">Profil</Link> kan du exportera/importera backup (JSON).</li>
        </ul>
        <div className="flex gap-2 pt-1">
          <Link to="/add" className="btn btn-primary">+ Ny film</Link>
          <Link to="/collections" className="btn">Samlingar</Link>
          <Link to="/profile" className="btn">Backup</Link>
        </div>
      </article>

      {/* Lägga till & redigera */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Lägga till & redigera filmer</h2>
        <ol className="list-decimal pl-6 space-y-1 text-sand-300">
          <li>Fyll i <em>Titel</em>, valfritt <em>År</em> och <em>Genrer</em>.</li>
          <li>Under <em>Ägande</em> välj t.ex. <span className="chip">Ägd</span>, <span className="chip">Digital</span> eller <span className="chip">Önskelista</span>.</li>
          <li>Om du vill: ange <em>Format</em> (UHD, Blu-ray, DVD…), <em>Plats/Hylla</em> och <em>Tjänst/Leverantör</em>.</li>
          <li>I <em>Utgåva & Teknik</em> kan du lägga in utgåva, region, videostandard, streckkod och egna anteckningar.</li>
          <li>Tryck <strong>Spara</strong>. Senaste titlar visas på startsidan.</li>
        </ol>
      </article>

      {/* Listor */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Samlingar (listor)</h2>
        <p className="text-sand-300">
          Skapa valfria samlingar (”Vampyrfilm”, ”Hylla B”, ”Att köpa”).
          Antalet filmer i varje lista visas direkt. Du kan byta namn eller ta bort listor när som helst.
        </p>
        <Link to="/collections" className="btn">Öppna Samlingar</Link>
      </article>

      {/* Sök & filter */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Sök & filter</h2>
        <p className="text-sand-300">
          På <Link to="/search" className="underline">Sök</Link> hittar du filmer via titel, genrer, streckkod
          eller text du skrivit i anteckningar/utgåva. Filtrera även på format eller status (t.ex. digital).
        </p>
        <Link to="/search" className="btn">Gå till Sök</Link>
      </article>

      {/* Backup */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Backup & flytta data</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li><strong>Exportera</strong> skapar en JSON-fil med alla filmer, listor och kopplingar.</li>
          <li><strong>Importera</strong> lägger till allt från en tidigare export (dubbletter undviks inte automatiskt).</li>
          <li><strong>Rensa allt</strong> tar bort all lokal data (själva appen ligger kvar).</li>
        </ul>
        <Link to="/profile" className="btn">Öppna Profil & Backup</Link>
      </article>

      {/* PWA */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">Installera som app (PWA)</h2>
        <p className="text-sand-300">
          På mobiler/surfplattor: öppna menyn i webbläsaren och välj <em>Installera</em> eller
          <em> Lägg till på startskärmen</em>. Då körs Cinemoria helskärm och fungerar offline.
        </p>
      </article>

      {/* FAQ / tekniskt */}
      <article className="card p-4 space-y-3">
        <h2 className="font-semibold">FAQ & tekniskt</h2>
        <ul className="list-disc pl-6 space-y-1 text-sand-300">
          <li><strong>Var lagras data?</strong> I webbläsarens IndexedDB på din enhet.</li>
          <li><strong>Synk?</strong> Nej, inte automatiskt. Använd export/import mellan enheter.</li>
          <li><strong>Teman?</strong> Byt mellan mörkt, ljust och sepia under <Link to="/profile" className="underline">Profil</Link>.</li>
        </ul>
      </article>
    </section>
  );
}
