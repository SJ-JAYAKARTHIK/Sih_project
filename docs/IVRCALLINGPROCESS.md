# KrishiDwaar — IVR Calling and Voice Slot Booking Process

> **System Channel**: Inbound Exotel Voice IVR Telephony Integration  
> **Backend Architecture**: Unified Express API + Supabase PostgreSQL  
> **Target Audience**: Farmers using basic feature phones without internet access  

---

## 1. Overall Architecture

The Voice IVR interface is an **inbound telephony channel** fully integrated into the existing KrishiDwaar Express backend and Supabase PostgreSQL database. It shares the **exact same booking engine, slot capacity rules, and WebSocket broadcaster** as the Web Portal.

```text
Farmer Phone (Feature Phone / Smartphone)
     │
     ▼
Exotel Virtual Number (Inbound Telephony)
     │
     ▼
Exotel IVR Webhook / Applet Sequence
     │
     ▼
Express Voice Handler (Railway: https://sihproject-production-9ad6.up.railway.app)
     │
     ▼
Shared Booking Engine (db.createBooking with source="VOICE_IVR")
     │
     ▼
Supabase PostgreSQL Database
     │
     ▼
WebSocket Broadcast Server (/ws)
     │
     ▼
Real-Time Web Dashboards (Farmer Portal + Mandi Officer Portal + Admin Portal)
```

---

## 2. Example Complete Call Walkthrough

Here is a complete, realistic phone call interaction using an existing verified test farmer (**Farmer ID `10029384` — Ramesh Verma**):

```text
================================================================================
[CALL CONNECTED]
================================================================================
SYSTEM (IVR Audio):
"Welcome to KrishiDwaar Smart Farmer Booking. Please enter your 8-digit Farmer ID using your phone keypad."

FARMER (Keypad Input):
10029384

SYSTEM (IVR Audio):
"Thank you, Ramesh Verma. Your Farmer ID has been verified. Please select your crop: Press 1 for Paddy, 2 for Wheat, 3 for Cotton, 4 for Maize, 5 for Pulses, 6 for Gram."

FARMER (Keypad Input):
5

SYSTEM (IVR Audio):
"Your selected crop is Pulses. The following Mandis accept this crop. Press 1 for Nizamabad APMC Mandi. Press 2 for Guntur Grain Yard."

FARMER (Keypad Input):
1

SYSTEM (IVR Audio):
"You selected Nizamabad APMC Mandi. Please enter your visit date in 4 digits DDMM format. For example, 1409 for September 14th."

FARMER (Keypad Input):
2509

SYSTEM (IVR Audio):
"Date set for 25 September. Please enter your preferred arrival time using 4 digits followed by star for AM or hash for PM. For example, 0300 hash for 3 PM."

FARMER (Keypad Input):
0300#

SYSTEM (IVR Audio):
"Time slot set for 3:00 PM. Please enter your expected crop quantity in kilograms, or press star to skip."

FARMER (Keypad Input):
100*

SYSTEM (IVR Audio - Summary Confirmation):
"Farmer: Ramesh Verma. Crop: Pulses. Mandi: Nizamabad APMC Mandi. Date: 25 September. Time: 3:00 PM. Expected quantity: 100 kg. To confirm this booking, press 1. To cancel, press 2."

FARMER (Keypad Input):
1

SYSTEM (IVR Audio - Confirmation):
"Your booking has been confirmed successfully. Your booking ID is BK-1789385015699-8489. Your token number is TKN-442980. The booking details have been sent to your registered mobile number. Thank you for using KrishiDwaar."
================================================================================
[CALL ENDED - SMS DISPATCHED & WEBSOCKET BROADCAST EMITTED]
================================================================================
```

---

## 3. Step-by-Step Input Format Specification

### Step 1 — Farmer ID Verification
* **Keypad Input**: `10029384`
* **Format**: Exactly 8 numeric digits.
* **Backend Processing**: `db.getFarmerById(farmerId)` queries Supabase `farmers` table.
* **Validation**:
  * Valid ID: Audio greets farmer by name (`"Welcome, Ramesh Verma"`) and advances session to `AWAITING_CROP`.
  * Invalid/Unregistered ID: Audio responds `"We could not find that Farmer ID. Please enter your 8-digit Farmer ID again."` and remains in `AWAITING_FARMER_ID`.
  * Non-8-digit input: Audio responds `"That was not a valid 8-digit Farmer ID."` and prompts retry.

---

### Step 2 — Crop Selection
* **Keypad Input**: Single digit (`1` to `6`).
* **Central Crop Mapping (`CROP_MAP`)**:
  * `1` → Paddy (`crop-1`)
  * `2` → Wheat (`crop-2`)
  * `3` → Cotton (`crop-3`)
  * `4` → Maize (`crop-4`)
  * `5` → Pulses / Toor Dal (`crop-5`)
  * `6` → Gram / Chickpea (`crop-6`)
* **Backend Processing**: Stores selected crop in `exotelSessions` map for this `CallSid` and advances to `AWAITING_MANDI`.

---

### Step 3 — Mandi Selection (Dynamic Filtering)
* **Keypad Input**: Single digit (`1`, `2`, etc., corresponding to dynamically generated audio menu options).
* **Dynamic Crop Filtering**: Backend queries `mandi_accepted_crops` junction table in Supabase via `getCompatibleMandisForCrop(cropId)` to find mandis accepting the selected crop.
* **Audio Prompt Build**: Dynamically constructs speech prompt, e.g., `"Press 1 for Nizamabad APMC Mandi. Press 2 for Guntur Grain Yard."`
* **Backend Processing**: Maps option digit to target `mandiId` (e.g. `MANDI02`) and advances session to `AWAITING_DATE`.

---

### Step 4 — Date Entry (`DDMM`)
* **Keypad Input**: `2509` (for 25th September).
* **Format**: Exactly 4 numeric digits (`DDMM`).
* **Backend Processing**: `parseDateDDMM(inputStr)` validates date against the current calendar year.
* **Validation**:
  * `2509` → Converted to ISO date string `2026-09-25` and formatted string `"25 September"`.
  * Past dates (e.g. `0101` for Jan 1) → Rejected with `PAST_DATE` audio error: `"The date cannot be in the past. Please enter today or a future date."`
  * Invalid dates (e.g. `3209` or `9999`) → Rejected with `INVALID_DATE_VALUES` audio error.

---

### Step 5 — Time Slot Entry (`HHMM*` / `HHMM#`)
* **Keypad Input**: `0300#` (for 3:00 PM) or `0430*` (for 4:30 AM).
* **Format**: 4 digits (`HHMM`) followed by `*` (AM) or `#` (PM).
* **Backend Processing**: `parseTimeInput(inputStr)` converts 12-hour input into standard 24-hour 30-minute time slots:
  * `0300#` → Converted to `15:00 - 15:30` (3:00 PM).
  * `0430*` → Converted to `04:30 - 05:00` (4:30 AM).
  * `0900*` → Converted to `09:00 - 09:30` (9:00 AM).
* **Validation**: Hours must be `01` to `12`, minutes `00` to `59`. Invalid strings prompt retry.

---

### Step 6 — Expected Quantity Entry
* **Keypad Input**: `100*` (for 100 kg) or `*` (to skip).
* **Format**: Digits followed by `*`, or a single `*`.
* **Backend Processing**:
  * `100*` → Parsed as `100` kg expected quantity.
  * `*` → Recorded as `null` (unspecified).
* **Note on Procurement**: This value represents the farmer's *expected* quantity. At the Mandi gate, the officer weighs the actual crop on physical scales and inputs the *actual quantity*, which dynamically overrides this value for final billing.

---

### Step 7 — Voice Summary & Final Confirmation
* **Keypad Input**: `1` (Confirm) or `2` (Cancel).
* **Audio Summary Readback**: System reads back all captured session values before writing to the database:
  > *"Farmer: Ramesh Verma. Crop: Pulses. Mandi: Nizamabad APMC Mandi. Date: 25 September. Time: 3:00 PM. Expected quantity: 100 kg. To confirm this booking, press 1. To cancel, press 2."*

---

## 4. Confirmation Backend Workflow

### Case A: Farmer Presses `1` (Confirm Booking)

```text
Farmer Presses 1
   │
   ▼
1. Re-validate Session Data (Farmer ID, Crop, Mandi, Date, Time)
   │
   ▼
2. Server-Side Atomic Slot Capacity Check (Ensure max 2 per slot)
   │
   ▼
3. Duplicate Active Booking Check (Reject if farmer has active booking on date)
   │
   ▼
4. Call db.createBooking({ source: "VOICE_IVR", ... })
   │
   ▼
5. Write Record to Supabase `bookings` Table
   │
   ▼
6. Generate Booking ID (BK-XXXXXXXX), Token (TKN-XXXXXX), & Signed QR JSON
   │
   ▼
7. Emit WebSocket Events: `VOICE_BOOKING_CREATED` and `BOOKING_CREATED`
   │
   ▼
8. Trigger SMS Dispatch Abstraction to Caller Mobile Number
   │
   ▼
9. Audio Confirmation Readback & Call Termination
```

### Case B: Farmer Presses `2` (Cancel Booking)
* Session stage updated to `CANCELLED`.
* No booking record written to database.
* Audio response: `"Your booking has been cancelled successfully. No slot has been booked. Thank you for using KrishiDwaar."`

---

## 5. Important Edge Case Validation Rules

| Edge Case | Backend Action | Audio Response to Caller |
| :--- | :--- | :--- |
| **Invalid Farmer ID** | Rejects non-existent 8-digit ID. | *"We could not find that Farmer ID. Please enter again."* |
| **Past Date Input** | Rejects dates prior to current date. | *"The date cannot be in the past. Please enter today or a future date."* |
| **Non-Existent Calendar Date** | Rejects invalid days/months (e.g. `3102`). | *"That calendar date does not exist. Please enter a valid date."* |
| **Invalid Time Format** | Rejects invalid time strings (e.g. `2500*`). | *"Invalid hour or minute value. Please re-enter."* |
| **Full Slot Capacity** | Rejects 3rd booking request when slot is full (max 2). | *"The selected time slot is full. Session returned to time selection."* |
| **Duplicate Booking** | Rejects second booking attempt for same farmer on same date. | *"You already have an active booking on this date."* |
| **Invalid Confirmation Digit** | Rejects digits other than 1 or 2. | Reads summary again and prompts Press 1 or 2. |
| **Session Inactivity Timeout** | Clears session after 20 minutes inactivity. | *"Your session has expired. Please call again."* |
| **Exotel Webhook Network Drop** | Returns HTTP fallback greeting. | Dynamic fallback greeting prompt. |

---

## 6. Exotel Passthru & Applet Sequence Flow

```text
[Inbound Phone Call]
        │
        ▼
[Exotel Greeting Applet] ──► Plays Welcome Audio
        │
        ▼
[Exotel Gather Applet 1] ──► Gathers 8-digit Farmer ID (DTMF)
        │
        ▼
[Exotel Passthru Webhook] ──► POST /api/voice/exotel (Validates Farmer ID)
        │
        ▼
[Exotel Gather Applet 2] ──► Gathers Crop, Mandi, Date, Time, Qty Keypad Inputs
        │
        ▼
[Exotel Passthru Webhook] ──► POST /api/voice/exotel (Processes IVR State Machine)
        │
        ▼
[Exotel Dynamic Greeting] ──► GET /api/voice/exotel/greeting (Fetches Dynamic Speech)
        │
        ▼
[Exotel Gather Applet 3] ──► Gathers Final Confirmation Digit (1 or 2)
        │
        ▼
[Exotel Passthru Webhook] ──► Creates Booking in Supabase & Returns "CONFIRMED"
        │
        ▼
[Call Concluded]
```

---

## 7. Production Telephony URLs

The voice handler is deployed on Railway and listens on the following public production endpoints:

* **Exotel Passthru Endpoint**:  
  `https://sihproject-production-9ad6.up.railway.app/api/voice/exotel`  
  *(HTTP Methods Supported: `GET` and `POST`)*

* **Exotel Dynamic Greeting Endpoint**:  
  `https://sihproject-production-9ad6.up.railway.app/api/voice/exotel/greeting`  
  *(HTTP Methods Supported: `GET`, `POST`, and `HEAD`)*

---

## 8. Real Call Execution Summary Table

| Call Stage | Farmer Keypad Input | Example Value | Backend Function / Execution | Resulting Session State |
| :--- | :--- | :--- | :--- | :--- |
| **1. Identity** | 8 Digits | `10029384` | `db.getFarmerById("10029384")` | `AWAITING_CROP` (Ramesh Verma) |
| **2. Crop** | 1 Digit | `5` | Maps digit to `crop-5` (Pulses) | `AWAITING_MANDI` |
| **3. Mandi** | 1 Digit | `1` | `getCompatibleMandisForCrop('crop-5')` | `AWAITING_DATE` (Nizamabad APMC) |
| **4. Date** | 4 Digits (`DDMM`) | `2509` | `parseDateDDMM("2509")` | `AWAITING_TIME` (`2026-09-25`) |
| **5. Time** | 4 Digits + `*`/`#` | `0300#` | `parseTimeInput("0300#")` | `AWAITING_QUANTITY` (`15:00 - 15:30`) |
| **6. Quantity** | Digits + `*` | `100*` | Parses quantity integer | `READY_FOR_CONFIRMATION` (100 kg) |
| **7. Confirm** | `1` | `1` | Server slot check + `db.createBooking()` | `BOOKED` (`source = "VOICE_IVR"`) |

---

## 9. Unified Web & IVR Booking Architecture

A core strength of KrishiDwaar is that **Web Bookings** and **IVR Voice Bookings** use the **exact same booking engine and database tables**:

```text
Web Booking Flow:  User ──► Web UI ──────► db.createBooking({ source: "WEB" }) ─────┐
                                                                                    ├─► Supabase PostgreSQL
Voice IVR Flow:   User ──► Phone Call ──► db.createBooking({ source: "VOICE_IVR" }) ─┘
```

### Why This Architecture Matters:
1. **Single Source of Truth**: No separate database or duplicated queue management for IVR calls.
2. **Same Capacity Limits**: Voice IVR bookings immediately reduce available slots on the Web Portal calendar.
3. **Identical Gate Passes**: Voice bookings generate valid Token Numbers (`TKN-XXXXXX`) and QR codes readable by the Mandi Officer camera scanner.
4. **Unified Analytics**: Admin statistics aggregate web and voice bookings into state-wide procurement figures.

---

## 10. Real-Time Web Updates Via WebSockets

When an IVR booking is confirmed, the backend immediately emits a WebSocket broadcast:

```text
IVR Booking Confirmed
        │
        ▼
db.createBooking({ source: "VOICE_IVR" })
        │
        ▼
Express Broadcast: broadcast('VOICE_BOOKING_CREATED', booking)
        │
        ▼
WebSocket Server (/ws)
        │
        ├─► Farmer Web Portal (Updates Queue Tracker)
        ├─► Mandi Officer Portal (Adds farmer to Today's Queue)
        └─► Admin Portal (Increments State Booking Count)
```

Web dashboards update **in real time without requiring browser page refreshes**.

---

## 11. Automated Test Verification

The Exotel Voice IVR calling pipeline has been thoroughly tested using an automated simulation suite (`server/test-voice-ivr.js`):

```text
====================================================
📊 EXOTEL VOICE IVR AUTOMATED TEST SUITE
====================================================
✅ Scenario 1: Happy Path E2E Voice Booking Lifecycle   11 / 11 PASSED
✅ Scenario 2: Invalid Input & Edge Cases               7 /  7 PASSED
✅ Scenario 3: Exotel Dynamic Greeting Endpoint          12 / 12 PASSED
✅ Scenario 4: Detailed Integration & Revalidation      10 / 10 PASSED
✅ Scenario 5: SMS Recipient Verification               6 /  6 PASSED
====================================================
🎉 EXOTEL TEST SUITE TOTAL:                             46 / 46 PASSED
====================================================
```

---

## 12. Presentation Demo Script for Live Demonstration

Follow this step-by-step guide to demonstrate the IVR flow during live judging:

### Setup Before Starting the Call
1. Open **Farmer Portal** on laptop monitor 1 (`https://krishidwaar.vercel.app/`).
2. Open **Mandi Officer Portal** on monitor 2 logged into `MANDI02` (Nizamabad APMC Mandi).

### Live Call Steps
1. **Dial Number**: Call the Exotel IVR virtual phone number.
2. **Enter Farmer ID**: Press `10029384` on phone keypad.
3. **Select Crop**: Press `5` (Pulses).
4. **Select Mandi**: Press `1` (Nizamabad APMC Mandi).
5. **Select Date**: Press `2509` (25th September).
6. **Select Time Slot**: Press `0300#` (3:00 PM).
7. **Enter Quantity**: Press `100*` (100 kg).
8. **Confirm Booking**: Press `1`.
9. **Show Live Web Update**: Point out to judges that **Mandi Officer Portal** and **Farmer Portal** instantly update with the new booking marked `[ VOICE_IVR ]` via WebSockets.
