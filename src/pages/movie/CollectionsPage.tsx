// titel-länken
<Link
  to={`/movie/collections/${id}`}   // <-- lägg till /movie
  className="font-semibold truncate hover:underline"
>
  {l.name}
</Link>

// "Öppna"-knappen
<Link
  to={`/movie/collections/${id}`}   // <-- lägg till /movie
  className="chip hover:opacity-90"
  title="Öppna"
>
  <ExternalLink size={14} />
  Öppna
</Link>