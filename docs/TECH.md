# Technology Stack Reference - KrishiDwaar

## Frontend Technologies
- **Core Library**: React 18
- **Build & Development Tool**: Vite
- **Styling**: Vanilla CSS (CSS variables, flexbox, CSS grid)
- **Routing**: State-based portal switching via React Context API
- **Icons**: `lucide-react`
- **QR Code Tools**: `qrcode`, `html5-qrcode`, `html2canvas`
- **Data Export**: `xlsx` (Excel report exporter)

---

## Backend Technologies
- **Runtime Environment**: Node.js
- **Web Framework**: Express v4.19
- **Real-Time Communication**: `ws` (WebSocket server)
- **Voice SDKs**: `twilio` package, Exotel HTTP webhooks

---

## Data Storage & Asset Pipeline
- **Database**: In-memory JSON database (`server/db.js`) backed by `server/data/store.json`.
- **Public Assets Source**: `public/assets/` (`admin_portal_assets/`, `farmer_portal_assets/`, `mandi_officer_portal_assets/`).
- **Production Distribution Output**: `dist/assets/` (generated via `npm run build`).

---

## CLI & NPM Commands

| Command | Action |
|---|---|
| `npm install` | Installs client and server dependencies |
| `npm run dev` | Runs Vite frontend and Express server concurrently |
| `npm run build` | Compiles Vite production bundle & assets to `dist/` |
| `npm run server` | Runs Express backend server only |
| `npm run client` | Runs Vite dev server only |
