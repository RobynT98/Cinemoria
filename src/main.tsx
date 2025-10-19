// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./global.css";

/**
 * Sätt sparat tema tidigt (light = inga extra klasser).
 * Vi låter index.html också göra en snabb initial set — detta är en
 * "second pass" ifall localStorage hunnit ändras tidigt.
 */
(() => {
  try {
    const saved = (localStorage.getItem("cm_theme") as "dark" | "light" | "sepia" | null) || "dark";
    const root = document.documentElement;
    root.classList.remove("dark", "sepia");
    if (saved === "dark") root.classList.add("dark");
    else if (saved === "sepia") root.classList.add("sepia");
  } catch {
    // no-op
  }
})();

/**
 * Vite BASE_URL (t.ex. "/Cinemoria/") -> Router basename
 * - BrowserRouter vill ha "" när vi är på root, inte "/".
 * - Ta bort trailing slash om den finns.
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
 * Registrera service worker (PWA, offline).
 * Viktigt: använd samma basename så att Pages-underkataloger funkar.
 */
if ("serviceWorker" in navigator) {
  const swUrl = `${basename || ""}/service-worker.js`.replace(/\/\//g, "/");
  navigator.serviceWorker.register(swUrl).catch(() => {
    // Tyst fail i dev/miljöer utan SW-stöd
  });
}