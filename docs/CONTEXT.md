# Business Context & User Journeys - KrishiDwaar

## Project Context
**KrishiDwaar** (SIH26032) is designed to solve systemic agricultural procurement bottlenecks in India. Unorganized mandi arrivals lead to multi-day queue lines, crop spoilage, and payment delays. Additionally, limited smartphone adoption requires a dual-channel strategy combining web dashboards and phone IVR booking.

---

## Targeted User Personas

### 1. Farmer
- **Needs**: Simple booking mechanism, real-time queue visibility, transparent pricing, and instant gate pass generation.
- **Access Channels**: Web portal (smartphones) or IVR phone call (feature phones).

### 2. Mandi Officer
- **Needs**: Fast gate verification, automated queue callouts, accurate digital weighing entries, and instant bill generation.
- **Access Channel**: Desktop / Tablet web portal.

### 3. Admin (KrishiDwaar Executive)
- **Needs**: Macro-level visibility across all mandis, total procurement tracking, payment status monitoring, and mandi-wise performance analytics.
- **Access Channel**: Desktop web portal.

---

## Detailed User Journeys

### Farmer Journey (Web)
1. Register/Login using 8-digit Farmer ID.
2. Select desired crop and preferred Mandi.
3. Select an available 30-minute time slot.
4. Receive instant digital token and QR gate pass.
5. Track live queue status (token being served, queue position, estimated wait time).
6. Arrive at Mandi gate, show QR code/token, complete weighing, and view digital receipt.

### Farmer Journey (IVR)
1. Dial KrishiDwaar IVR toll-free number.
2. Enter 8-digit Farmer ID via phone keypad (DTMF).
3. Backend validates farmer registration.
4. Select crop (press 1-6).
5. Receive confirmation and token via voice.

### Mandi Officer Journey
1. Login to designated Mandi dashboard (`MANDI01`).
2. Scan incoming farmer QR code or input token number at gate.
3. Mark farmer as "ARRIVED".
4. Call next arrived farmer to weighing counter ("IN_PROGRESS").
5. Record weighed quantity (Quintals) and generate digital procurement receipt.

### Admin Journey
1. Login to KrishiDwaar Admin Executive Dashboard.
2. Review state overview banner and metric cards (Mandis, Farmers, Bookings, Arrivals, Procured Qty, Payments).
3. Switch between **Overview** (state statistics) and **Mandi Analysis** (commodity tables and search filters).
