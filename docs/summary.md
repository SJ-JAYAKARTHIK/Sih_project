# KrishiDwaar (SIH26032) - Project Summary

## Executive Summary
**KrishiDwaar** (SIH26032) is an end-to-end, multi-portal digital crop procurement and mandi queue management platform built for modern agricultural logistics. The system addresses long waiting times, lack of real-time mandi capacity transparency, and low digital literacy among farmers through a dual web and IVR (Interactive Voice Response) architecture.

---

## Key System Accomplishments & Current Status

### 1. Unified 3-Portal Web Architecture
- **Farmer Portal**: Features 30-minute slot booking, live queue progress tracking, multi-language support (English, Hindi, Telugu), instant QR gate pass generation, and digital procurement billing.
- **Mandi Officer Portal**: Mandi-specific operational interface providing QR code scanning, arrival verification, live queue call-outs, actual quantity weighing, and digital invoice generation.
- **Admin Portal**: Fully customized dashboard featuring a dark deep-green header, state overview banner, 2-row metric grid (Total Mandis, Farmers, Bookings, Verified Arrivals, Pending, Completed, Quantity Procured, Payment Released), and comprehensive Mandi Performance & Commodity Analysis tables.

### 2. Provider-Neutral Inbound Voice / IVR Booking Engine
- **State Machine Architecture**: Full 12-stage state machine (`server/voiceHandler.js`) supporting 8-digit Farmer ID verification, 1-6 crop mapping, dynamic Mandi availability filtering, DDMM date parsing, `HHMM*`/`HHMM#` time slot selection, expected quantity entry, and booking confirmation.
- **Unified DB Integration**: Creates bookings with `source: "VOICE_IVR"`, generating standard Token Numbers and QR gate passes visible across Farmer and Mandi Officer portals.
- **Real-Time Notifications & SMS**: Emits WebSocket broadcasts (`VOICE_BOOKING_CREATED`) and dispatches confirmation SMS to the farmer's registered mobile number.
- **Testing & Verification**: Verified via 18/18 automated test suite (`node server/test-voice-ivr.js`).

### 3. Multi-Lingual & Real-Time Sync
- **i18n Engine**: Centralized context-driven translation layer seamlessly handling live language toggling across Farmer, Mandi Officer, and Admin portals.
- **Real-Time WebSockets**: Live event broadcasting for instant synchronization of queue states, arrival verifications, and slot bookings across officer and farmer screens.

### 4. Static Asset & Build Optimization
- **Asset Consolidation**: All production static image assets (logos, crop illustrations, UI cards, background textures, status badges) are stored in `public/assets/` (`admin_portal_assets/`, `farmer_portal_assets/`, `mandi_officer_portal_assets/`).
- **Production Build Pipeline**: Built via Vite (`npm run build`), compiling all assets into `dist/assets/` with clean bundling. The legacy root `Assets/` directory has been removed.

---

## Technology Stack Overview

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Vanilla CSS design system, React Context API |
| **Backend** | Node.js, Express v4, WebSocket (`ws`) server |
| **Voice / IVR** | Provider-neutral 12-stage IVR engine (`server/voiceHandler.js`), Exotel passthru webhooks |
| **Storage** | In-memory & synchronous JSON file store (`server/data/store.json`) |
| **Integrations** | Twilio SDK & Exotel Webhooks for IVR DTMF processing, SMS service abstraction |
| **Assets & Build** | Vite public asset pipeline outputting directly to `dist/assets/` |

---

## Documentation Directory Index

- [README.md](file:///c:/Users/uday0/OneDrive/Desktop/KARTHIK/MY%20NEW%20SIH%20PROJECT/docs/README.md) - Main project documentation & setup guide.
- [summary.md](file:///c:/Users/uday0/OneDrive/Desktop/KARTHIK/MY%20NEW%20SIH%20PROJECT/docs/summary.md) - Executive summary & project milestone overview.
- [phases.md](file:///c:/Users/uday0/OneDrive/Desktop/KARTHIK/MY%20NEW%20SIH%20PROJECT/docs/phases.md) - Multi-phase roadmap detailing completed work and future roadmap.
- [ARCHITECTURE.md](file:///c:/Users/uday0/OneDrive/Desktop/KARTHIK/MY%20NEW%20SIH%20PROJECT/docs/ARCHITECTURE.md) - System component layout, data flows, and WebSocket architecture.
- [DESIGN.md](file:///c:/Users/uday0/OneDrive/Desktop/KARTHIK/MY%20NEW%20SIH%20PROJECT/docs/DESIGN.md) - UI design system, color palettes, and portal design specs.
- [API.md](file:///c:/Users/uday0/OneDrive/Desktop/KARTHIK/MY%20NEW%20SIH%20PROJECT/docs/API.md) - REST API endpoints, payload structures, and IVR webhooks.
- [DATABASE.md](file:///c:/Users/uday0/OneDrive/Desktop/KARTHIK/MY%20NEW%20SIH%20PROJECT/docs/DATABASE.md) - JSON data schemas, ER diagram, and table specifications.
- [CONTEXT.md](file:///c:/Users/uday0/OneDrive/Desktop/KARTHIK/MY%20NEW%20SIH%20PROJECT/docs/CONTEXT.md) - Business problem, user personas, rules, and journeys.
- [IVR.md](file:///c:/Users/uday0/OneDrive/Desktop/KARTHIK/MY%20NEW%20SIH%20PROJECT/docs/IVR.md) - Phone-based IVR call flows, DTMF mappings, and webhook state machines.
- [RULES.md](file:///c:/Users/uday0/OneDrive/Desktop/KARTHIK/MY%20NEW%20SIH%20PROJECT/docs/RULES.md) - Development rules, code guidelines, and operational constraints.
- [SECURITY.md](file:///c:/Users/uday0/OneDrive/Desktop/KARTHIK/MY%20NEW%20SIH%20PROJECT/docs/SECURITY.md) - Authentication, data protection, and Supabase RLS security plan.
- [TECH.md](file:///c:/Users/uday0/OneDrive/Desktop/KARTHIK/MY%20NEW%20SIH%20PROJECT/docs/TECH.md) - Technology stack reference, dependencies, and shell commands.
- [technical_requirements.md](file:///c:/Users/uday0/OneDrive/Desktop/KARTHIK/MY%20NEW%20SIH%20PROJECT/docs/technical_requirements.md) - Future Supabase migration plan and production architectural specification.
