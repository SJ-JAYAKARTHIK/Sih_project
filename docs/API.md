# API Reference - KrishiDwaar

*All REST API endpoints are served by the Node.js Express backend (`server/index.js`).*

---

## Authentication APIs

### `POST /api/auth/farmer-login`
- **Purpose**: Authenticate Farmer using 8-digit ID and password.
- **Request**: `{ "farmerId": "10029384", "password": "..." }`
- **Response**: `{ "success": true, "farmer": { "id": "10029384", "name": "...", "language": "EN" } }`

### `POST /api/auth/farmer-register`
- **Purpose**: Register a new farmer and auto-generate an 8-digit unique ID.
- **Request**: `{ "name": "...", "mobile": "...", "password": "...", "language": "HI", "location": "..." }`
- **Response**: `{ "success": true, "farmerId": "10029004" }`

### `POST /api/auth/mandi-login`
- **Purpose**: Authenticate Mandi Officer.
- **Request**: `{ "mandiId": "MANDI01", "password": "..." }`
- **Response**: `{ "success": true, "mandi": { ... } }`

### `POST /api/auth/admin-login`
- **Purpose**: Authenticate KrishiDwaar Administrator.
- **Request**: `{ "username": "admin", "password": "..." }`
- **Response**: `{ "success": true, "user": { "role": "ADMIN" } }`

---

## Master Data APIs

### `GET /api/master/crops`
- **Purpose**: Retrieve list of supported crops and their MSP rates per quintal.

### `GET /api/master/mandis`
- **Purpose**: Retrieve registered Mandis, locations, and accepted crop lists.
- **Query Parameters**: `cropId` (optional filter).

---

## Slot & Booking APIs

### `GET /api/slots/availability`
- **Purpose**: Get 30-day capacity metrics for a Mandi.
- **Query Parameters**: `mandiId`, `cropId`.

### `GET /api/slots/time-slots`
- **Purpose**: Get 30-minute interval availability for a specific date.
- **Query Parameters**: `mandiId`, `date`.

### `POST /api/bookings/create`
- **Purpose**: Reserve a slot and issue a digital token and QR gate pass.
- **Request Body**: `{ "farmerId", "mandiId", "cropId", "date", "timeSlot", "expectedQty", "source" }`

### `POST /api/bookings/cancel`
- **Purpose**: Cancel an existing active booking.
- **Request Body**: `{ "bookingId", "farmerId" }`

### `POST /api/bookings/reschedule`
- **Purpose**: Reschedule date and time slot for a booking.

### `GET /api/bookings/farmer/:farmerId`
- **Purpose**: Fetch booking history for a specific farmer (includes both web and `VOICE_IVR` bookings).

### `GET /api/bookings/mandi/:mandiId`
- **Purpose**: Fetch Mandi bookings for a specific date (`?date=YYYY-MM-DD`).

---

## Queue & Procurement APIs

### `GET /api/queue/mandi/:mandiId`
- **Purpose**: Fetch active queue list categorized into Waiting, In-Progress, and Completed.

### `GET /api/queue/farmer/:farmerId`
- **Purpose**: Fetch live queue status for a farmer (queue position, estimated wait, current token).

### `POST /api/arrivals/verify`
- **Purpose**: Mandi officer verifies farmer arrival at gate using QR code or token ID.
- **Request Body**: `{ "mandiId", "tokenNumber" }`

### `POST /api/queue/start-procurement`
- **Purpose**: Mandi officer calls next waiting farmer to the weighing counter.

### `POST /api/procurement/complete`
- **Purpose**: Finalize procurement, enter actual weighed quantity, and issue bill.
- **Request Body**: `{ "mandiId", "bookingId", "actualQty", "billedBy" }`

---

## Voice / IVR Webhooks (`server/voiceHandler.js`)

### `GET/POST /api/voice/exotel`
- **Purpose**: Primary Exotel Passthru webhook endpoint for live IVR call sessions.
- **Parameters**: `CallSid` / `CallFrom`, `digits` (DTMF inputs).
- **Session State Machine**:
  - `INIT` → `AWAITING_FARMER_ID` → `AWAITING_CROP` → `AWAITING_MANDI` → `AWAITING_DATE` → `AWAITING_TIME` → `AWAITING_QUANTITY` → `READY_FOR_CONFIRMATION` → `BOOKED` / `CANCELLED` / `ERROR`.
- **Response Format**: Provider-neutral JSON containing `success`, `stage`, `prompt`, `mandiOptions`, `summary`, and `booking` details.

### `POST /api/voice/exotel/test`
- **Purpose**: Integration testing endpoint simulating IVR keypad entries without phone hardware.

### `POST /api/voice/incoming` & `POST /api/voice/farmer-id`
- **Purpose**: Twilio voice XML endpoints for TwiML fallback.
