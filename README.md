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