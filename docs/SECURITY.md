# Security Specifications & Guidelines - KrishiDwaar

## Current Authentication Model
- **Farmers**: Authenticate using 8-digit unique ID and password.
- **Mandi Officers**: Authenticate using Mandi ID (`MANDI01`) and password.
- **Administrators**: Authenticate using hardcoded admin credentials.

---

## Data Isolation & Authorization
- **Farmer Operations**: Restricted to their own `farmerId`. Farmers can only view, cancel, or reschedule their own bookings.
- **Mandi Operations**: Mandi Officers can only verify arrivals and complete procurements for their assigned `mandiId`.
- **Admin Operations**: Read-only macro analytical access across all mandis.

---

## Static Asset & Environment Security
- **Static Assets**: Stored under `public/assets/` and built into `dist/assets/`. No sensitive data or configuration files are placed in asset folders.
- **Environment Secrets**: Backend variables (`PORT`, `NO_SHOW_GRACE_PERIOD_MINUTES`) stored in `.env`.
- **API Keys**: No raw secret credentials or production API keys are committed to repository control.

---

## Future Security Hardening (Supabase BaaS Blueprint)
- **Supabase Auth**: Migration to JWT-based Supabase Auth using pseudo-emails (`[farmer_id]@agriprocure.local`).
- **PostgreSQL Row Level Security (RLS)**: Enforce database-level policies ensuring farmers can only read/write their own rows.
- **HMAC Webhook Signatures**: Implement signature verification for incoming Exotel and Twilio voice webhooks.
