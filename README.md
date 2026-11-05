# Hotel Living Hub — Website

Lightweight static site built with Astro and plain CSS. Ships zero JavaScript except a tiny inline script on the booking page.

## Run locally

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
npm run preview  # serve the built site
```

## Folder structure

```
hotel-living-hub/
├── astro.config.mjs        # site URL (update once domain is registered)
├── package.json
├── public/                 # served as-is
│   ├── favicon.svg
│   ├── robots.txt
│   └── images/
│       ├── hero.webp       # homepage banner (add)
│       ├── rooms/          # standard.webp, deluxe.webp, family.webp
│       └── gallery/        # reception.webp, room.webp, ...
└── src/
    ├── data/
    │   ├── site.json       # name, phone, WhatsApp, email, address, map, form key
    │   └── rooms.json      # room types, prices, amenities
    ├── styles/global.css   # colours and shared styles
    ├── layouts/BaseLayout.astro   # <head>, SEO tags, Hotel JSON-LD
    ├── components/
    │   ├── Header.astro
    │   ├── Footer.astro
    │   ├── RoomCard.astro
    │   └── WhatsAppButton.astro   # floating chat button
    └── pages/
        ├── index.astro     # Home
        ├── rooms.astro
        ├── book.astro      # enquiry form + WhatsApp/call
        ├── gallery.astro
        ├── location.astro
        ├── contact.astro
        └── 404.astro
```

## Before going live

1. Fill in `src/data/site.json`: phone, WhatsApp number (country code, digits only, e.g. `919876543210`), email, address.
2. Get a free Web3Forms access key and set `formAccessKey`.
3. Google Maps → Share → Embed a map → copy the `src` URL into `mapEmbedUrl`.
4. Update room names, prices and amenities in `src/data/rooms.json`.
5. Add photos as WebP in `public/images/` (keep each under ~200 KB).
6. Set the final domain in `astro.config.mjs`.

## Deploy (Cloudflare Pages)

Connect the GitHub repo → Framework preset **Astro** → Build command `npm run build` → Output directory `dist`.
