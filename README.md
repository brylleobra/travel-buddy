# travel buddy

Monorepo: Next.js (React) + Express API + MongoDB + Worker (scraper) + Ollama Llama3.2:3b.

## Quick start
1) Copy `.env.example` -> `.env` and fill values.
2) Ensure MongoDB and Ollama are running locally.
   - `ollama pull llama3.2:3b`
3) `pnpm install`
4) `pnpm dev` (web:3000, api:4000, worker: schedules)

## Production
- Replace test endpoints/keys with live.
- Honor robots.txt and site ToS.
- For payments, follow provider tokenization (Duffel / Rapid) or use a PSP (Stripe/Adyen).
