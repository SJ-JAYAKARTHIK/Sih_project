# Development Rules & Guidelines - KrishiDwaar

## General Code Principles
- **Inspect Before Mutating**: Inspect existing code using `view_file` or `grep_search` before modifying.
- **Preserve Existing Architecture**: Maintain the 3-portal layout and Node.js Express + React structure.
- **No Hardcoded Asset Paths outside `public/assets`**: Ensure all static graphics reside in `public/assets/` so Vite bundles them cleanly into `dist/assets/`. Never reference a root `Assets/` directory.
- **Zero Symptom-Masking**: Fix underlying root causes rather than swallowing exceptions.

---

## Frontend Guidelines
- **Component Scope**: Keep portal views encapsulated inside `src/portals/` (`FarmerPortal/`, `MandiOfficerPortal/`, `AdminPortal/`).
- **Styling**: Use Vanilla CSS variables defined in `index.css`. Maintain agricultural color palette consistency.
- **Multi-Language (i18n)**: All user-facing strings in portal components must pass through `t()` translation helpers provided by `AppContext`.
- **State Hydration**: Keep user session state centralized in `AppContext.jsx`.

---

## Backend Guidelines
- **Data Persistence**: Manage data through `server/db.js`. Ensure changes synchronously write to `server/data/store.json`.
- **WebSocket Broadcasts**: Every mutation modifying booking status, queue position, or arrival verification MUST call `broadcast()` to push updates to all active WebSocket clients.
- **Route Validation**: Validate request parameters and return proper HTTP error status codes (400, 404, 500) with JSON error payloads.

---

## Build & Asset Rules
- All production static assets MUST be stored in `public/assets/`.
- Run `npm run build` to build static output into `dist/` (`dist/assets/`).
- Ensure no references to the legacy root `Assets/` folder remain in source files.
