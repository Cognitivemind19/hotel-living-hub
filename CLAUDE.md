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

Static Astro site, plain CSS, no framework, no backend, no client JS except a tiny inline script on `book.astro`.

- `src/data/site.json` and `src/data/rooms.json` are the source of truth for content (contact info, rooms/prices). Pages read from them rather than hardcoding text.
- Room `slug` links `RoomCard` → `/book/?room=<slug>` → the pre-select script in `book.astro`. Keep slugs in sync if renamed.
- Booking form posts directly to Web3Forms (`site.json`'s `formAccessKey`) — no backend.
- Shared styles/classes live in `src/styles/global.css`; page-specific CSS goes in a scoped `<style>` block in that `.astro` file.
- Internal links use trailing slashes (`/rooms/`), which `Header.astro` relies on for active-link highlighting.

## Known placeholders

Pre-launch stubs, not bugs: `site.json` phone/whatsapp/formAccessKey/mapEmbedUrl/social, `location.astro`'s `nearby` distances, the testimonials note in `index.astro`, and the domain in `astro.config.mjs`.

## Deploy

Cloudflare Pages: preset Astro, build `npm run build`, output `dist`.
