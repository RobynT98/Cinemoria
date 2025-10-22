[![Live](https://img.shields.io/badge/Live-Cinemoria-%231f6feb?logo=githubpages&logoColor=white)](https://robynt98.github.io/Cinemoria/)
[![Docs](https://img.shields.io/badge/Docs-index.md-%23555555)](index.md)
[![License](https://img.shields.io/badge/License-GPL--3.0-%2323b26d)](LICENSE.md)
[![PWA](https://img.shields.io/badge/PWA-Ready-%237851fa)](#installera-som-app-pwa)
[![Privacy](https://img.shields.io/badge/Privacy-Local%20only-%2300b894)](#integritet)
[![Offline](https://img.shields.io/badge/Offline-Yes-%2300c853)](#funktioner-i-korthet)
[![Built%20with-React%20·%20Vite%20·%20TS](https://img.shields.io/badge/Built%20with-React%20·%20Vite%20·%20TS-%231e88e5)](#teknisk-översikt)
[![Host-GitHub%20Pages](https://img.shields.io/badge/Host-GitHub%20Pages-%23222?logo=github&logoColor=white)](https://github.com/robynt98/Cinemoria)
# Cinemoria 📽️🎧📚🎮
En privat PWA för att minnas allt du sett, läst, spelat och lyssnat på — **helt lokalt** i din webbläsare.

**Live:** https://robynt98.github.io/Cinemoria/

---

## Vad är det?
Cinemoria började som en filmdatabas och har vuxit till ett litet **minnesvalv** för:
- **Filmer**
- **Böcker**
- **Spel**
- **Album (musik)**
- **Serier (comics)**

Allt sparas **offline (IndexedDB)**. Ingen inloggning, ingen server, ingen spårning.

---

## Funktioner i korthet
- ✅ **PWA** – installera på hemskärmen, helskärm, fungerar offline  
- 🎛️ **Tema** – mörkt, ljust, sepia  
- ⚡ **Autofyll (valfritt)** – OMDb-nyckel för filmdata (lagras lokalt)  
- 📷 **Streckkodstest** – snabb koll av kamera inför skanning  
- 💾 **Backup** – export/import av hela databasen som JSON  
- 🧹 **Reset** – rensa allt lokalt innehåll med ett klick  
- 📨 **Feedback & delning** – mailto med förifylld teknisk info + kopiera app-länk  
- 🧭 **Instruktioner** – kort hjälpsektion i appen

---

## Installera som app (PWA)
**Android/Chrome/Edge/desktop:** öppna länken → *Installera app* (ikon i adressfältet)  
**iOS (Safari):** dela-ikonen → **Lägg till på hemskärmen**

> Appen känner själv av om den körs “standalone”.

---

## Snabbstart
1) Öppna **Cinemoria** → *Profil*  
2) (Valfritt) Klistra in **OMDb API key** om du vill ha film-autofyll  
3) (Valfritt) **Importera JSON** om du har en tidigare backup  
4) Välj **tema** och kör

---

## Backup & återställning
- **Exportera JSON:** *Profil → Backup → Exportera*  
- **Importera JSON:** *Profil → Backup → Importera*  
Importen visar en snabb sammanfattning, t.ex.:  
• Filmer +X, Listor +Y, Kopplingar +Z … (per kategori)

---

## Integritet
- Lagring: **IndexedDB i din webbläsare**  
- Ingen telemetri, inga cookies, ingen nätverkssynk  
- Feedback sker manuellt via **mailto** (frivillig, opt-in)

---

## Teknisk översikt
- **React + React Router**  
- **PWA** (manifest + service worker)  
- **IndexedDB** för data  
- **GitHub Pages** för hosting  
- Licens: **GNU GPL v3.0**

---

## Licens & upphov
© 2025 **Conri Turesson** — GNU GPL v3.0  
Mer info: `LICENSE.md`