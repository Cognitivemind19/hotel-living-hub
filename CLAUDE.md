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

Static Astro site, plain CSS, no framework, no backend. Client JS is limited to small scripts on the home availability bar and `book.astro`.

- `src/data/*.json` is the source of truth for content: `site.json` (contact info, nav, amenities, reviews), `rooms.json`, `venues.json`, `offers.json`, `attractions.json`. Pages read from them rather than hardcoding text. Unset values (`price`, `guests`, `distance`, `reviews`, `attractions`, `mapEmbedUrl`) are hidden on the page.
- Room `slug` links `RoomCard` and `AvailabilityBar` → `/book/?room=<slug>` → the pre-fill script in `book.astro`. Keep slugs in sync if renamed.
- "Check Availability" does not query live inventory: it passes dates, room and guests to `/book/`, where the guest sends a request.
- Forms post directly to Web3Forms through `Web3Form.astro` (`site.json`'s `formAccessKey`) — no backend. On success Web3Forms redirects to `/?sent=1`, which shows a thank-you notice. When `site.json`'s `sheetsWebAppUrl` is set, each form's `sheet` prop also sends a copy to a Google Sheet via the Apps Script in `google-apps-script/Code.gs` (the user deploys that script themselves).
- Shared styles/classes live in `src/styles/global.css`; page-specific CSS goes in a scoped `<style>` block in that `.astro` file.
- Internal links use trailing slashes (`/rooms/`), which `Header.astro` relies on for active-link highlighting.

## Known placeholders

Pre-launch stubs, not bugs: `site.json` reviews, provisional room prices in `rooms.json`, distances in `attractions.json`, and the sample packages in `offers.json`.

## Deploy

Cloudflare Pages: preset Astro, build `npm run build`, output `dist`.
