# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output to dist/
npm run preview  # serve the built site
```

No linter, type-checker, or tests — verify with `npm run build`.

## Architecture

Static Astro site, plain CSS, no framework, no backend. Client JS is limited to small scripts: the home availability bar, the pre-fill in `book.astro` and `banquet.astro`, and the cart on `order.astro`.

- `src/data/*.json` is the source of truth for content: `site.json` (contact info, nav, amenities, reviews, `onlineDiscount`, `delivery`), `rooms.json`, `venues.json`, `menu.json` (restaurant + delivery menu), `events.json` (banquet event types), `offers.json`, `attractions.json`. Pages read from them rather than hardcoding text. Unset values (`price`, `guests`, `distance`, `reviews`, `attractions`, `mapEmbedUrl`) are hidden on the page.
- Room `slug` links `RoomCard` and `AvailabilityBar` → `/book/?room=<slug>` → the pre-fill script in `book.astro`. Keep slugs in sync if renamed.
- The website sells four services, each with an online-only discount (`site.json` `onlineDiscount`, read via `src/lib/offer.ts` and shown by `OfferBanner.astro`): rooms (`/rooms/`, `/book/`), restaurant table reservations (`/restaurant/`), food delivery (`/order/`) and the banquet hall (`/banquet/`). There is no payment gateway: every order or booking is a request the hotel confirms by phone. `/dining/` redirects to `/restaurant/` (see `astro.config.mjs`).
- The `/order/` cart fills `order`, `subtotal`, `discount` and `total` fields that use the `hidden` attribute, not `type="hidden"`, so the Google Sheet copy includes them.
- "Check Availability" does not query live inventory: it passes dates, room and guests to `/book/`, where the guest sends a request.
- Forms post directly to Web3Forms through `Web3Form.astro` (`site.json`'s `formAccessKey`) — no backend. On success Web3Forms redirects to `/?sent=1`, which shows a thank-you notice. When `site.json`'s `sheetsWebAppUrl` is set, each form's `sheet` prop also sends a copy to a Google Sheet via the Apps Script in `google-apps-script/Code.gs` (the user deploys that script themselves). A new `sheet` value needs a matching entry in `TABS` there, and the script must be redeployed.
- Shared styles/classes live in `src/styles/global.css`; page-specific CSS goes in a scoped `<style>` block in that `.astro` file.
- Internal links use trailing slashes (`/rooms/`), which `Header.astro` relies on for active-link highlighting.

## Known placeholders

Pre-launch stubs, not bugs: `site.json` reviews, provisional room prices in `rooms.json`, dishes and prices in `menu.json`, delivery hours/area in `site.json`, distances in `attractions.json`, and the sample packages in `offers.json`.

## Deploy

Cloudflare Pages: preset Astro, build `npm run build`, output `dist`.
