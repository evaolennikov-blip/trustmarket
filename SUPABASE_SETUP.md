# Supabase Setup — TrustMarket

## 1. Create a Supabase project

1. Go to https://supabase.com and sign in
2. New project → name it `trustmarket`, pick a region close to Russia (Frankfurt or Stockholm)
3. Set a strong database password — save it somewhere

## 2. Get your API keys

Dashboard → Settings → API

Copy:
- **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3. Run the schema

Dashboard → SQL Editor → New query

Paste and run `schema.sql` (full database schema — users, listings, transactions, etc.)

Then run `waitlist_table.sql`.

## 4. Enable Phone Auth

Dashboard → Authentication → Providers → Phone

Toggle on. You'll need a Twilio account for SMS in production.
For testing, Supabase has a built-in OTP dev mode — check "Enable phone confirmation" and use test numbers.

## 5. Add secrets to GitHub Actions

GitHub repo → Settings → Secrets and variables → Actions → New repository secret

Add two secrets:
- `NEXT_PUBLIC_SUPABASE_URL` — paste Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — paste anon key

The deploy workflow already injects these at build time.

## 6. Trigger a redeploy

```bash
git commit --allow-empty -m "trigger deploy with Supabase keys"
git push
```

Watch Actions tab — build will now have real env vars. Waitlist form and auth will be live.

## 7. Verify

1. Go to https://evaolennikov-blip.github.io/trustmarket/
2. Submit the waitlist form
3. Check Supabase Dashboard → Table Editor → waitlist — row should appear
4. Try /auth — enter a phone number, check if SMS sends (or check Supabase Auth logs)
