import { useEffect, useState } from "react";

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/api/hello")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ error: "API unavailable" }));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", maxWidth: "40rem", margin: "4rem auto", padding: "0 1rem" }}>
      <h1>{{name}}</h1>
      <p>Generated with <code>apps-cli</code> (Express + Vite React).</p>
      <pre>{data ? JSON.stringify(data, null, 2) : "loading…"}</pre>
    </main>
  );
}
