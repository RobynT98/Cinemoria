// src/main.tsx
// se till att i18n initieras innan något renderas
import "./i18n";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./global.css";

/**
 * GH Pages 404-redirect bridge:
 * 404.html skickar hit: index.html?redirect=1#/<path>?q#hash
 * Vi plockar upp det och ersätter addressraden till riktig path,
 * så BrowserRouter får /<BASE_URL>/<path> direkt.
 */
(() => {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("redirect") === "1" && url.hash.length > 1) {
      const encoded = url.hash.slice(1);
      const decoded = decodeURIComponent(encoded);

      // Säkerställ ledande slash
      const path = decoded.startsWith("/") ? decoded : `/${decoded}`;

      // Vite BASE_URL (ex: "/Cinemoria") utan trailing slash
      const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

      // Om path redan börjar med basen, använd den – annars prefixa
      const nextRaw = path.startsWith(base) ? path : `${base}${path}`;

      // Städa upp eventuella dubbelslashar
      const next = nextRaw.replace(/\/{2,}/g, "/");

      // Skriv om utan att reloada (och bli av med ?redirect=1)
      history.replaceState(null, "", next);
    }
  } catch {
    /* noop */
  }
})();

/**
 * Sätt sparat tema tidigt (light = inga extra klasser).
 */
(() => {
  try {
    const saved =
      (localStorage.getItem("cm_theme") as "dark" | "light" | "sepia" | null) ||
      "dark";
    const root = document.documentElement;
    root.classList.remove("dark", "sepia");
    if (saved === "dark") root.classList.add("dark");
    else if (saved === "sepia") root.classList.add("sepia");
  } catch {
    /* noop */
  }
})();

/**
 * BrowserRouter basename från Vite BASE_URL.
 * ("/" -> "", annars ta bort trailing slash)
 */
const rawBase = import.meta.env.BASE_URL || "/";
const basename = rawBase === "/" ? "" : rawBase.replace(/\/$/, "");

const rootEl = document.getElementById("root")!;
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

/**
 * Registrera service worker (PWA/offline) med samma basename.
 */
if ("serviceWorker" in navigator) {
  const swUrl = `${basename || ""}/service-worker.js`.replace(/\/\//g, "/");
  navigator.serviceWorker.register(swUrl).catch(() => {});
}