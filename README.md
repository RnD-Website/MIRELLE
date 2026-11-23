# MIRELLE – Premium Beauty & Hair Studio

Static multi-page site (no build step). Layout, scroll animation and interaction system follow the reference
(showcasemd.io): GSAP 3 + ScrollTrigger + SplitText, Lenis smooth scroll, em-based fluid sizing.

## Structure
- `index.html` – home (hero TV zoom, numbers, practice, steps, flip cards, brands marquee, reviews, CTA)
- `services.html`, `service-*.html` (9) · `about.html`
- `booking.html` (6-step request) · `reviews.html` · `contact.html` · `journal.html`, `journal-*.html` (8)
- `privacy.html`, `terms.html` (template text) · `404.html` · `sitemap.xml` · `robots.txt` · `vercel.json`
- `assets/css/ref.css` (design system) · `home.css` · `inner.css`
- `assets/js/site.js` (animations, nav, Calendly, newsletter) · `inner.js` (filters, lightbox, booking, contact) · `data.js` (config + content)
- `assets/js/vendor/` GSAP, ScrollTrigger, SplitText, Lenis (local copies)

## Before launch
1. `assets/js/data.js` → `MIRELLE.config`: set the real `calendlyUrl`, `constantContactAction` (newsletter form URL), `contactEndpoint` (Formspree/Getform), phone, email, address.
   Until set, forms open a pre-filled email and never show a fake "sent" message.
2. Replace sample brands, reviews, prices, team bios and legal text with real content.
3. Colours follow the reference exactly (pink #CF018F, ink #1E1E1E, peach #CDA07F, white) via variables at the top of `assets/css/ref.css`.
   Fonts: Inter Tight + Instrument Serif (free) stand in for the reference's Suisse + Awesome Serif, which are commercial fonts. If you license them, add the .woff2 files to `assets/fonts/` and change `--sans` / `--serif` in `ref.css`.
4. The hero TV is a CSS/image reel; add a real video by replacing `.reel` with a `<video>`.
5. Pages are generated, so edit the HTML directly or ask for the generator to be re-run.

Palette (from the reference): Pink #CF018F · Ink #1E1E1E · Peach #CDA07F · Blush #EDAFB7 · White #FFFFFF.
