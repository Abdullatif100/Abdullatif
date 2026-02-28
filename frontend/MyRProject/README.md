# Waste Management Frontend (Vite + React)

## Local development
1. Install dependencies:
```bash
npm install
```
2. Run development server:
```bash
npm run dev
```

By default, local requests use `/api` and are proxied to `http://localhost:8000` via `vite.config.js`.

## Environment variables
Use `.env` (see `.env.example`):

- `VITE_API_BASE_URL`:
  - Local: `/api`
  - Production (Vercel): `https://your-backend-domain.com/api`
- `VITE_API_TIMEOUT_MS` (default `15000`)
- `VITE_API_WITH_CREDENTIALS` (`true` or `false`, default `false`)

## Vercel deployment
1. Import this frontend project (`frontend/MyRProject`) into Vercel.
2. Build settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add environment variable in Vercel:
   - `VITE_API_BASE_URL=https://your-backend-domain.com/api`
   - Optional: `VITE_API_TIMEOUT_MS=15000`
   - Optional: `VITE_API_WITH_CREDENTIALS=false`
4. Deploy.

`vercel.json` already includes SPA rewrite so refresh on routes like `/dashboard` and `/report-waste` works correctly.
