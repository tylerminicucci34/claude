# Lead Finder

Finds local businesses that have **no website** — prime prospects if you sell web design, marketing, or online-presence services — and gives you their **phone number and email** so you can reach out.

## How it works

1. Enter a location (city, town, or zip), pick a business field, radius, and how much contact info a lead must have.
2. The app geocodes the location with **Nominatim** and pulls live business listings from **OpenStreetMap via the Overpass API** — no API keys, no accounts.
3. It keeps only businesses that have contact info on record but **no website tag**, dedupes them, and ranks the best leads first (phone + email = "hot").
4. Export everything to CSV for your outreach list.

## Business fields covered

Restaurants & food, beauty & wellness, trades & contractors (plumbers, electricians, roofers…), auto services, health & medical, professional services, retail shops, fitness & sports, pet services, hotels & lodging — or search all types at once.

## Columns

| Column | Meaning |
|---|---|
| Phone / Email | Pulled from the listing's contact tags (`phone`, `contact:phone`, `email`, `contact:email`) |
| Online presence | `no web presence` = nothing on record; `social only` = has a Facebook/Instagram but still no real website |
| Verify | Google search for the business — sanity-check there's really no website before you pitch |
| Map / Source | Location on OpenStreetMap and the raw data record |

## Running it

It's a static page — open `index.html` in a browser (or serve the folder with any static server). Data is fetched live from public APIs at search time.

**Note:** the public Overpass servers rate-limit heavy use. If a search fails, wait a minute and retry — the app automatically fails over across three public endpoints.
