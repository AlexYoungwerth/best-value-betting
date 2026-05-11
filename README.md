# Best Value Betting

A React/Vite prototype for finding betting value across:

- sportsbook odds via The Odds API
- user-reported casino table minimums and game odds via Supabase
- prediction-market contract pricing via Polymarket
- demo mode for showing seeded examples without live credentials

## Run Locally

```bash
npm install
npm run dev
```

Create `.env` from `.env.example` if you want Supabase reports or an auto-loaded sportsbook API key.

## Live Data Notes

- Sportsbook odds require `VITE_ODDS_API_KEY` or a key pasted into the app.
- Casino tables and game odds are populated from the shared `oddstable_reports` table.
- Prediction markets currently pull public Polymarket markets through the Vite proxy.
- A production deployment should move API keys and provider requests behind a backend proxy.
