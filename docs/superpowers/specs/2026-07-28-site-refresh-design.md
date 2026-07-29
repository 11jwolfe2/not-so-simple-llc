# Not So Simple, LLC — Site Refresh

**Date:** 2026-07-28
**Repo:** `git@github.com:11jwolfe2/not-so-simple-llc.git`
**Status:** Design approved, ready for implementation planning

---

## Problem

The site is stock v0 output. It works, but it reads as generated: a dark canvas
with a flat purple accent, every surface an identical `bg-white/5` rounded
rectangle, a stock illustration in the hero, and copy generic enough to describe
any consultancy. It also carries real defects — broken link previews, dead
footer links, hotlinked third-party images, and a build that ignores TypeScript
errors.

The site's job is credibility. It is not hunting clients; it needs to look
deliberate when someone Googles the LLC or receives the link directly.

## Goals

1. Replace the generic visual language with one that reads as considered.
2. Replace generic and stale copy with specific, accurate copy.
3. Add the missing credibility element: a named person with real background.
4. Fix the defects that are visible to visitors.

## Non-Goals

- Lead generation, funnels, analytics, or conversion optimization.
- Multi-page routing. This stays a single page.
- Framework upgrades. Stays on Next.js 14 and Tailwind 3.
- Any mention of Undertime.
- Any named employer, current or past. Domains only.

---

## Visual System

**Direction: Editorial Light.** A full reversal of the current dark theme. The
confidence comes from typography, whitespace, and restraint rather than color
and effects. Chosen partly because almost no software consultancy looks like
this — the differentiation is the point on a credibility site.

### Palette

| Token | Value | Use |
|---|---|---|
| `paper` | `#F4F2ED` | Page background (warm off-white) |
| `paper-sunk` | `#EBE8E1` | Selected Work band |
| `ink` | `#14130F` | Body text, headings, contact/footer background |
| `ink-dim` | `rgba(20,19,15,.58)` | Secondary body copy |
| `ink-faint` | `rgba(20,19,15,.44)` | Eyebrow labels |
| `rule` | `rgba(20,19,15,.16)` | Hairline dividers and borders |

There is no accent color. Emphasis comes from scale, weight, and inversion.
The existing `#7F62F4` purple is removed entirely.

These become CSS custom properties consumed through the Tailwind theme, not
hardcoded hex values scattered through components — which is the current
failure mode.

### Type

- **Display:** Instrument Serif, regular, tracking `-0.02em`.
- **Body/UI:** Inter, 400/500/600.
- Both self-hosted via `next/font/google` so there is no runtime request to
  Google and no layout shift.

Scale (desktop): hero display 92px/0.92 · section heads 44px/1.05 · project
titles 34px · bio name 38px · body 15–17px/1.65 · eyebrow 10.5px with
`0.18em` tracking, uppercase.

### Layout

- Content column max-width 920px, 56px gutters.
- Sections separated by hairline rules or background shifts — never by cards.
- Generous vertical rhythm: 76–96px section padding.

---

## Page Structure

Single page, five sections, in order:

### 1. Hero
Eyebrow "Software Consulting" · display "Not so simple." · two-column row
beneath with the positioning paragraph left and the two links right.

> The simple version of the problem is rarely the one that ships. I do
> architecture and full-stack engineering for teams building systems that have
> to hold up once the edge cases show up.

Links: "Get in touch →" (underlined, primary) and "See the work" (quiet).

### 2. Approach
Replaces the three service cards with a numbered editorial list. Each row is a
three-column grid — numeral, title, description — separated by hairline rules.

Section head: "Three ways I'm usually useful."

| № | Title | Copy |
|---|---|---|
| 01 | Software architecture | Systems designed to survive their second year. Data models, service boundaries, and the handful of decisions that get expensive to reverse later. |
| 02 | Full-stack development | Shipped product, not prototypes. Front to back, including the deploys, migrations, and monitoring that decide whether it actually works in the world. |
| 03 | Technical consulting | A straight second opinion. Build-versus-buy, stack choices, and an honest read on what's actually slowing the team down. |

### 3. Selected Work
Background shifts to `paper-sunk`. Two entries in alternating two-column
layout (text/image, then image/text). Each has a category eyebrow, serif
title, description, and an underlined external link.

Section head: "Two things worth showing."

**BankFinder.us** — eyebrow "Fintech / Live" — https://bankfinder.us
> Most people never switch banks because comparing them is miserable.
> BankFinder puts modern banking alternatives side by side, so finding a
> better account takes minutes instead of an afternoon.

**Athena** — eyebrow "Crypto / Live" — https://www.athena.foo
> On-chain activity breaks conventional bookkeeping. Athena applies AI to
> blockchain transaction history and turns it into accounting records a human
> can actually file taxes from.

The current Athena description ("Web3 security platform providing real-time TGE
alerts and protection against malicious actors") is factually stale and is
being replaced, not restyled.

### 4. Who's Behind It
New section — does not exist today. Two columns: headshot left (4:5), name and
bio right.

**Headshot:** `public/jack-wolfe.jpg`, cropped 4:5 and rendered in **warm
monochrome** — `grayscale(1) sepia(.28) contrast(1.06) brightness(1.05)`,
applied as a CSS filter so the source image stays unmodified and the grade
stays adjustable. The source photo has a green outdoor background; warm
monochrome pulls it into the paper/ink palette, which otherwise has no color
in it at all.

**Jack Wolfe III**

> Eleven years building production software: five in aerospace, six in finance.
> Two fields that agree on very little except the important part — the edge
> cases aren't hypothetical, and "mostly correct" isn't a state you're allowed
> to ship in.
>
> Not So Simple is where that experience goes to work for other teams. The name
> is the whole thesis: the problems worth hiring someone for are the ones
> without a clean answer, and pretending otherwise is how projects get
> expensive.

Below the bio, a two-cell numeral strip: **05** / Years / Aerospace and
**06** / Years / Finance, split by a hairline rule.

Location line: Streetsboro, Ohio.

No employer is named. "Aerospace" and "finance" are deliberate — this was
decided explicitly, not by omission.

### 5. Contact
Page inverts: `ink` background, `paper` text. Section head "Got something that
isn't simple?" followed by `jack@not-so-simple.com` set at 38px serif as a
`mailto:` link with an underline.

Below a hairline rule, the contact form in a two-column row: explanatory line
left ("Prefer to write it out? The form goes to the same inbox."), form right.
Fields are underline-only — no boxes, no fills — matching the editorial system.

### Footer
Inside the inverted block. `© <year> Not So Simple, LLC` left, `Streetsboro,
Ohio` right.

### Navigation
Sticky, translucent paper with backdrop blur and a bottom hairline. Wordmark
"Not So Simple" in serif at left; Work / Approach / Contact at right. Mobile
keeps the existing sheet drawer, restyled.

---

## Removed

- **Technologies section** — the eight-name chip grid. It reads as a résumé and
  asserts nothing a client wouldn't assume.
- **Hero illustration** (`public/hero-image.png`) — stock flat-vector art.
- **Purple `#7F62F4`** in all its hardcoded appearances.
- **`bg-white/5` card treatment** throughout.

---

## Component Structure

Each component owns one section and holds its own content. No shared props
plumbing — the content is static and belongs next to the markup that renders it.

```
app/
  layout.tsx        fonts, metadata, Nav + Footer shell
  page.tsx          composes the five sections, no content of its own
  globals.css       CSS custom properties for the palette
components/
  Nav.tsx           sticky nav + mobile sheet
  Hero.tsx
  Approach.tsx      numbered list; rows are a local array
  SelectedWork.tsx  two projects; entries are a local array
  Bio.tsx           photo, bio copy, numeral strip
  Contact.tsx       heading + mailto + ContactForm
  ContactForm.tsx   restyled; validation and error handling added
  Footer.tsx
```

`page.tsx` currently holds every section's markup and content inline in a
single 190-line client component. Splitting it is part of this work: each
section becomes independently readable and editable, and only `ContactForm`
and `Nav` need `"use client"` — the rest become server components.

## Contact Form

Keeps Web3Forms. Current gaps to close:

- No client-side validation beyond `required`.
- Submits with an empty `access_key` if the env var is missing, and surfaces
  the resulting API error as a raw message.
- Success/error state is inferred by substring-matching `"error"` in the
  response text.

Replace with explicit state (`idle | submitting | success | error`), a
validated email field, a guard for the missing access key, and messages
written for the page rather than passed through from the API.

## Technical Cleanup

In scope alongside the redesign:

1. **Missing OG images.** `layout.tsx` references
   `/not-so-simple-og-1200x630.png` and `/notsosimple_logo_fixed_white_bg.png`;
   neither exists in `public/`. Link previews are broken today. Generate both
   in the new visual system.
2. **Dead footer links.** Privacy Policy and Terms of Service both point to
   `#`. Remove them — a one-page credibility site with no data collection
   beyond a contact form doesn't need either, and a dead link is worse than no
   link.
3. **Hotlinked screenshots.** Both project images load from
   `hebbkx1anhila5yf.public.blob.vercel-storage.com`. Capture fresh screenshots
   of both live sites, commit to `public/`, serve locally.
4. **Unused shadcn kit.** 50 components in `components/ui/`, of which the site
   uses Button, Input, Textarea, and Sheet. Delete the other 46 along with the
   now-orphaned Radix dependencies.
5. **Package name.** `my-v0-project` → `not-so-simple-llc`.
6. **Build config.** `next.config.mjs` sets `typescript.ignoreBuildErrors` and
   `eslint.ignoreDuringBuilds` to `true`, and imports a `v0-user-next.config`
   that doesn't exist. Remove the dead import and stop ignoring errors.
7. **Orphaned stylesheet.** `styles/globals.css` (94 lines) is imported
   nowhere — only `app/globals.css` (41 lines) is loaded, by `layout.tsx`.
   Delete the orphan.
8. **Tailwind theme.** The config defines a full shadcn token set that nothing
   uses while components hardcode hex. Replace with the palette above.

Explicitly out of scope: upgrading to Next.js 15 or Tailwind 4.

## Known Issue

**Headshot resolution.** The supplied photo is 324×456; cropped to 4:5 it is
324×405. The bio slot renders at roughly 300px CSS wide, so the image is at
about 1× on a standard display and well under 1× on retina — it will look soft
next to sharp type. Warm monochrome masks this somewhat, which is part of why
it was chosen. Accepted deliberately rather than overlooked. If a full-size
original becomes available later, re-crop to 4:5 at ≥800px wide and drop it in
at the same path; no code changes needed.

## Verification

- `npm run build` passes with TypeScript checking re-enabled.
- Every section renders correctly at 375px, 768px, and 1440px.
- Contact form submits successfully, and fails legibly when the access key is
  absent.
- OG and Twitter images resolve — checked against the built output, not
  assumed.
- No remaining references to `#7F62F4`, the Vercel blob host, or Undertime.
- Both project links open the correct live sites.
