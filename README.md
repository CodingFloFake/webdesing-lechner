# Lechner Webdesign

Lokale, responsive One-Page-Website für Lechner Webdesign. Die Seite ist mit
React und TypeScript umgesetzt und orientiert sich an einer dunklen,
editorialen Premium-Ästhetik.

## Voraussetzungen

- Node.js `>=22.13.0`
- npm

## Lokal starten

```bash
npm install
npm run dev
```

Danach die in der Konsole angezeigte lokale Adresse öffnen (standardmäßig
`http://localhost:3000`).

## Prüfen

```bash
npm run build
npm run lint
npm test
```

## Aufbau

- `app/page.tsx` – Einstieg der One-Page-Website
- `app/components/LechnerSite.tsx` – Header, Hero, Leistungen, Projekt-Showcase,
  Anfrageformular und Footer
- `app/globals.css` – komplettes Designsystem, Animationen und responsive Styles
- `app/layout.tsx` – Sprache und Seitendaten

Das Anfrageformular arbeitet aktuell als Frontend-Demo. Nach erfolgreicher
Validierung wird eine Bestätigung angezeigt; ein echtes Backend kann später im
Submit-Handler ergänzt werden.
