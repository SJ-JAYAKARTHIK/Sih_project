# UI Design & Styling Specifications - KrishiDwaar

## Design System Overview
**KrishiDwaar** features a modern, agricultural-themed user interface utilizing Vanilla CSS variables. The layout is responsive across mobile, tablet, and desktop viewports, delivering high visual contrast and clear typographic hierarchy.

---

## Palette & Visual Language

- **Primary Deep Green**: `#043e1d` (Header bars, dark theme accents, primary buttons)
- **Forest Green**: `#0f532b` (Borders, active navigation items)
- **Mandi Gold / Amber**: `#d97706` (Warning indicators, pending status badges)
- **Emerald Green**: `#10b981` (Success status, verified badges, completed cards)
- **Background Texture**: Light agricultural grey `#f8fafc` paired with custom page background graphics (`public/assets/admin_portal_assets/29_page_background.png`).

---

## Portals & Screen Breakdown

### 1. Farmer Portal Layout
- **Header**: Deep green header bar with KrishiDwaar logo, language toggle (EN/HI/TE), profile summary, and logout button.
- **Welcome Banner**: Agriculture slogan banner with crop graphics.
- **Slot Booking Component**: Calendar date picker with green (low), yellow (medium), and red (full) capacity indicators. 30-minute slot grid.
- **Live Queue Widget**: Real-time position card, estimated wait time badge, current token indicator, and gate pass QR code.

### 2. Mandi Officer Portal Layout
- **Mandi Branding Header**: Displays active Mandi identity (`MANDI01`), officer details, and system status.
- **Verification Panel**: Dual token text search and QR scanner webcam integration.
- **Live Queue Table**: Displays waiting farmers, call-next action buttons, and procurement weighing input fields.

### 3. Admin Portal Executive Dashboard
- **Top Header**: Deep-green header featuring KrishiDwaar logo, portal navigation, language control, and admin profile pill.
- **State Overview Banner**: Features crop graphics, state summary analytics, and regional procurement overview.
- **2-Row Metric Grid**:
  - Row 1: Total Mandis, Total Farmers, Total Bookings, Verified Arrivals.
  - Row 2: Pending Procurements, Completed Procurements, Quantity Procured, Payment Status.
- **Dual Tab Navigation**: Overview & Mandi Analysis sub-views.
- **Mandi Performance Table**: Full-width data table with status pills, search filters, and export options.

---

## Asset Management Specifications
All visual assets are stored in `public/assets/` and built to `dist/assets/`:
- `public/assets/admin_portal_assets/`: Header icons, overview illustrations, metric card graphics, table headers, background wallpapers.
- `public/assets/farmer_portal_assets/`: Crop icons, live queue badges, token card graphics.
- `public/assets/mandi_officer_portal_assets/`: Mandi identity icons, quick action art, performance section graphics.
