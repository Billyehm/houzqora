# HOUZQORA

Netherlands rental and property inspection platform. Work in progress, front-end flow prototype.

## Market and money
- Netherlands only, not Nigeria.
- Currency: euros, rents shown monthly.
- Sample cities: Amsterdam, Rotterdam, Utrecht, The Hague.

## Brand
- Main colour: velvet red #5E1220.
- Accent: strawberry red #E63B4E.
- Background: light strawberry #FFF5F3, with red dots.
- Forest green was rejected as too generic.

## User flow (agreed 2026-10-30)
1. Public landing page: eye-catching, shows everything, search and featured homes.
2. When a visitor wants to book, show signup / login auth.
3. After login, the first page is Welcome browse homes.
4. From there, the person can enter My homes.
5. My homes is streamlined: no adverts, only the houses involved, what is paid, and what is next (pay inspection fee, pick a viewing slot, decide, then pay the securing amount).

## Files
- `index.html`: working landing plus auth plus logged-in flow (current build).
- `landing.html`: earlier velvet red landing page preview.
- `preview.html`: earlier 4-palette preview.

## Status
- Demo auth and demo payment only in this prototype. No real account, database, or money yet.
- Next real build steps: Next.js, database, real auth, and a Netherlands payment gateway (Mollie or Stripe with iDEAL, to be confirmed; Paystack was in the original spec but is not the natural Netherlands choice).
- Paying an inspection fee does not reserve a property.
