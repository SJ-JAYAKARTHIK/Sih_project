# KrishiDwaar (SIH26032) - Implementation Phases & Roadmap

This document outlines the software development lifecycle, completed phases, and future roadmap for the **KrishiDwaar** Farmer Procurement Platform.

---

## Phase Breakdown Matrix

| Phase | Focus Area | Status | Deliverables |
|---|---|---|---|
| **Phase 1** | Starting Page (Landing Page) | Completed | Hero banner ("From Farm to Market, We Bridge the Gap"), brand identity, 3 role highlights (Farmers, Mandis, Administrators), circular illustration graphic, and interactive `Get Started` entry button. |
| **Phase 2** | Core Portals | Completed | Three-portal architecture (Farmer Portal, Mandi Officer Portal, Admin Portal) with unified top navbar navigation, role switching, and global state (`AppContext.jsx`). |
| **Phase 3** | Account & Authentication | Completed | User registration & authentication with 8-digit Farmer IDs, Mandi officer credentials, Admin login, and session persistence. |
| **Phase 4** | Slot Allocation & Live Queue | Completed | 30-min slot reservation system, color-coded capacity indicators, token generation, WebSocket queue updates. |
| **Phase 5** | Mandi Officer Operations | Completed | Gate arrival verification (QR code & Token), active queue calling, actual weight entry, instant billing. |
| **Phase 6** | KrishiDwaar Admin Portal | Completed | Deep-green header, state overview banner, 2-row metric grid, commodity procurement breakdown, Mandi analysis. |
| **Phase 7** | Multi-Language System (i18n) | Completed | Real-time English/Hindi/Telugu translation context, seamless language switching across dashboards post-login. |
| **Phase 8** | Static Asset Consolidation & Build | Completed | Consolidated assets to `public/assets/`, deleted legacy `Assets/` folder, verified Vite build output into `dist/assets/`. |
| **Phase 9** | Inbound Voice / IVR Backend Engine | Completed | 12-stage provider-neutral voice engine (`server/voiceHandler.js`), 8-digit Farmer ID verification, dynamic crop-to-mandi filtering, DDMM date parsing, `HHMM*`/`HHMM#` time parsing, 0-999 qty entry, summary confirmation, pre-booking revalidation, `source: "VOICE_IVR"` DB entry, WebSocket broadcast, SMS abstraction, and 18/18 test suite pass. |
| **Phase 10** | Supabase Migration & AI Integration | Future | PostgreSQL database, Supabase Auth, Row Level Security, Bhashini Voice AI, production SMS gateway connection. |

---

## Phase Details

### Phase 1: Starting Page (Landing Page)
- Designed and built the primary landing page (`LandingPage.jsx`) as the initial gateway to the KrishiDwaar platform.
- Highlights brand slogan: *"From Farm to Market, We Bridge the Gap"* and motto *"Empowering Farmers | Strengthening Markets | Building a Smarter Tomorrow"*.
- Features dedicated role feature cards for Farmers, Mandis, and Administrators detailing key value propositions.
- Includes circular agricultural artwork, decorative leaf SVGs, and an interactive **Get Started** button to launch core portal navigation.

### Phase 2: Core Portals & Navigation Architecture
- Established 3 distinct portal environments: **Farmer Portal**, **Mandi Officer Portal**, and **Admin Portal**.
- Created unified header navigation (`Navbar.jsx`) with quick portal switching and brand styling.
- Implemented `AppContext.jsx` for global state management, role selection, and portal switching.

### Phase 3: Account & Authentication Management
- Implemented farmer registration (`FarmerRegister.jsx`) and login (`FarmerLogin.jsx`) flows using unique 8-digit Farmer IDs.
- Built credential-based login for Mandi Officers (`MandiLogin.jsx`) and Administrators (`AdminLogin.jsx`).
- Managed secure session state and user account persistence.

### Phase 4: Slot Allocation & Live Queue Engine
- Created 30-minute interval slot booking algorithm with daily capacity caps (max 20 slots/day per mandi).
- Implemented green/yellow/red slot availability indicators.
- Built live queue status cards for farmers displaying queue position, estimated wait times, and current token being served.

### Phase 5: Mandi Officer Operations & Instant Digital Billing
- Implemented QR code reader and manual token lookup for gate pass verification.
- Developed real-time queue controls allowing officers to transition bookings from "ARRIVED" to "IN_PROGRESS" and "COMPLETED".
- Integrated automated procurement bill calculation (`actualQty * ratePerQuintal`) with payment transaction ID generation.

### Phase 6: KrishiDwaar Admin Portal Redesign & Asset Integration
- Recreated the Admin Portal dashboard to match the KrishiDwaar reference design.
- Integrated high-resolution crop illustrations, decorative leaf headers, dark deep-green brand headers, and metric card styling.
- Designed two primary sub-views: **Overview** (macro analytics) and **Mandi Analysis** (micro performance metrics and search filters).

### Phase 7: Multi-Language (i18n) Synchronization
- Integrated a multi-lingual translation dictionary into `AppContext.jsx`.
- Resolved translation state bugs to ensure language selection persists seamlessly after user login across Farmer and Mandi dashboards.

### Phase 8: Asset Consolidation & Build Pipeline
- Re-organized all graphic elements into structured directories under `public/assets/`:
  - `public/assets/admin_portal_assets/`
  - `public/assets/farmer_portal_assets/`
  - `public/assets/mandi_officer_portal_assets/`
- Successfully deleted the root `Assets/` directory.
- Configured Vite build script (`npm run build`) to generate output in `dist/assets/`.

### Phase 9: Inbound Voice / IVR Backend Engine
- Developed `server/voiceHandler.js` featuring a 12-stage provider-neutral voice state machine.
- Enabled 8-digit Farmer ID verification (`db.getFarmerById`), dynamic crop-to-mandi filtering (1=Paddy, 2=Wheat, 3=Cotton, 4=Maize, 5=Pulses, 6=Gram), DDMM date parsing, `HHMM*`/`HHMM#` time parsing, and expected quantity entry.
- Connected Exotel passthru routes (`/api/voice/exotel` GET/POST) and test endpoint (`/api/voice/exotel/test` POST).
- Reused core database logic to save bookings with `source: "VOICE_IVR"`, Token Numbers, and QR payloads.
- Added SMS abstraction and WebSocket broadcasting. Verified with 18/18 test suite pass (`node server/test-voice-ivr.js`).

### Phase 10: Future Roadmap & Production Hardening
1. **Supabase BaaS Migration**: Migrate `db.js` JSON file store to Supabase PostgreSQL with Row Level Security (RLS).
2. **Bhashini Voice AI**: Integrate Bhashini translation API into Edge Functions for localized regional speech prompts in IVR calls.
3. **Production SMS Gateway**: Connect live Twilio / Exotel SMS API credentials to `sendBookingSms()` for SMS dispatch to farmers upon slot reservation.
