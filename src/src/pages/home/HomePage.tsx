import { Link, useNavigate } from "react-router-dom";

export default function HomePage() {
  const nav = useNavigate();

  return (
    <section className="p-4 space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Cinemoria</h1>
        <p className="text-sand-300">
          En hylla för allt du äger och älskar — film, böcker och spel. Offline och snabbt.
        </p>
      </header>

      <div className="card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Välj sektion</h2>
            <p className="text-sand-300 text-sm">
              Hoppa in i film, böcker eller spel. Lägg till nytt, sök eller bygg samlingar.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/movie" className="btn btn-primary">Film</Link>
            <Link to="/book" className="btn">Böcker</Link>
            <Link to="/game" className="btn">Spel</Link>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h3 className="font-semibold mb-2">Snabbstart</h3>
        <div className="flex gap-2 flex-wrap">
          <button className="btn" onClick={() => nav("/movie/add")}>Lägg till film</button>
          <button className="btn" onClick={() => nav("/book/add")}>Lägg till bok</button>
          <button className="btn" onClick={() => nav("/game/add")}>Lägg till spel</button>
        </div>
      </div>
    </section>
  );
}