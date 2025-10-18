export default function HomePage() {
  return (
    <section className="p-4">
      <h1 className="text-2xl font-semibold mb-3">Cinemoria</h1>
      <p className="text-sand-300">Din filmvärld, offline och snabb. Här dyker senast tillagda upp.</p>

      {/* Placeholder tom-state tills DB finns */}
      <div className="card mt-6 p-6">
        <p className="text-sand-300">Du har inga filmer ännu.</p>
      </div>
    </section>
  )
}