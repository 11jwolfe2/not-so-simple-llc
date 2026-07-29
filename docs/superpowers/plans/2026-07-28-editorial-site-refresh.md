# Editorial Site Refresh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stock v0 dark/purple treatment on not-so-simple.com with an editorial light design system, rework the page content, add a bio section, and fix the defects the current site ships with.

**Architecture:** Single-page Next.js 14 App Router site. `app/page.tsx` becomes a thin composition of five section components, each owning its own content. Colors live as CSS custom properties consumed through the Tailwind theme — never hardcoded in components. Only `Nav` and `ContactForm` are client components; everything else is a server component. A Vitest suite guards content, links, and asset existence.

**Tech Stack:** Next.js 14.2.16, React 18, TypeScript 5, Tailwind CSS 3.4, `next/font/google` (Inter + Instrument Serif), Vitest 4 + React Testing Library 16, Web3Forms.

**Spec:** `docs/superpowers/specs/2026-07-28-site-refresh-design.md`

**Branch:** `feature/site-refresh` (already created; spec committed at `8670cf5`, headshot at `5f78ecf`)

---

## Global Constraints

These apply to every task. Violating any one of them is a task failure.

- **Node 22 / npm 10.** `node_modules` is absent on a fresh clone — run `npm install` before anything else.
- **No framework upgrades.** Stays on Next.js 14.2.16, React 18, Tailwind 3.4. Do not upgrade to Next 15 or Tailwind 4.
- **Never mention Undertime** anywhere — code, copy, comments, commit messages, alt text.
- **Never name an employer,** current or past. The bio says "aerospace" and "finance". Do not write NASA, Fifth Third, or any company name.
- **No accent color.** The palette is paper/ink only. `#7F62F4` must not survive anywhere in the repo.
- **No hardcoded hex in components.** Colors come from Tailwind classes backed by CSS custom properties. The one exception is `globals.css`, where the properties are defined.
- **Copy is verbatim from the spec.** Do not paraphrase, improve, or re-tone the marketing copy. If a string in this plan differs from the spec, the spec wins — stop and flag it.
- **Legal name is "Jack Wolfe III".** Location is "Streetsboro, Ohio".
- **Contact email is `jack@not-so-simple.com`.**
- **Commit after every task** using the message given in that task's final step.

---

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `vitest.config.ts` | Test runner config: jsdom env, React plugin, `@/` alias |
| `vitest.setup.ts` | jest-dom matchers, `next/image` mock |
| `components/Nav.tsx` | Sticky nav + mobile sheet (client) |
| `components/Hero.tsx` | Hero section |
| `components/Approach.tsx` | Numbered services list |
| `components/SelectedWork.tsx` | Two project entries |
| `components/Bio.tsx` | Headshot, bio copy, numeral strip |
| `components/Contact.tsx` | Contact heading, mailto, form wrapper, footer |
| `tests/assets.test.ts` | Asserts every public asset referenced in source exists on disk |
| `tests/sections.test.tsx` | Asserts section copy and links render correctly |
| `tests/ContactForm.test.tsx` | Form validation, submit states, missing-key guard |
| `public/og-1200x630.png` | OpenGraph card |
| `public/work-bankfinder.png` | Self-hosted BankFinder screenshot |
| `public/work-athena.png` | Self-hosted Athena screenshot |

**Modified:** `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `tailwind.config.ts`, `next.config.mjs`, `package.json`, `components/ContactForm.tsx`

**Deleted:** `components/Footer.tsx` (absorbed into `Contact.tsx`), `components/Navigation.tsx` (replaced by `Nav.tsx`), `styles/globals.css`, `public/hero-image.png`, `public/placeholder*.{svg,png,jpg}`, 46 of 50 files in `components/ui/`

---

## Task 1: Test Infrastructure and Asset Guard

Establishes the test harness and immediately uses it to catch the bug already in the repo: `app/layout.tsx` references two images that do not exist in `public/`.

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`, `tests/assets.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: nothing
- Produces: `npm test` (single run) and `npm run test:watch`. Later tasks add files under `tests/`.

- [ ] **Step 1: Install dependencies**

```bash
npm install
npm install -D vitest@^4.1.10 @vitejs/plugin-react@^6.0.4 jsdom@^30.0.0 \
  @testing-library/react@^16.3.2 @testing-library/dom@^10.4.1 \
  @testing-library/jest-dom@^7.0.0 @testing-library/user-event@^14.6.1
```

`@testing-library/dom` is a required peer of RTL 16 and must be installed explicitly — RTL will not resolve without it.

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "node:path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
})
```

- [ ] **Step 3: Create `vitest.setup.ts`**

`next/font` cannot run outside the Next compiler, and `next/image` needs a stub in jsdom. Both are mocked here so component tests import cleanly.

```ts
import "@testing-library/jest-dom/vitest"
import React from "react"
import { vi } from "vitest"

vi.mock("next/image", () => ({
  default: ({ priority, fill, quality, placeholder, blurDataURL, loader, ...rest }: any) =>
    React.createElement("img", rest),
}))
```

- [ ] **Step 4: Add test scripts to `package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write the failing asset test**

Create `tests/assets.test.ts`. It scans source for `/`-rooted asset references and asserts each exists in `public/`. This permanently prevents the class of bug currently in `layout.tsx`.

```ts
import { describe, it, expect } from "vitest"
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs"
import path from "node:path"

const ROOT = path.resolve(__dirname, "..")
const ASSET_RE = /["'`](\/[A-Za-z0-9._\-\/]+\.(?:png|jpg|jpeg|svg|ico|webmanifest))["'`]/g

function sourceFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".next" || entry === ".git") continue
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...sourceFiles(full))
    else if (/\.(tsx?|mjs)$/.test(entry)) out.push(full)
  }
  return out
}

describe("public assets", () => {
  it("every asset referenced in source exists in public/", () => {
    const missing: string[] = []
    for (const dir of ["app", "components"]) {
      for (const file of sourceFiles(path.join(ROOT, dir))) {
        const src = readFileSync(file, "utf8")
        for (const match of src.matchAll(ASSET_RE)) {
          const ref = match[1]
          if (!existsSync(path.join(ROOT, "public", ref))) {
            missing.push(`${path.relative(ROOT, file)} -> ${ref}`)
          }
        }
      }
    }
    expect(missing).toEqual([])
  })
})
```

- [ ] **Step 6: Run it and confirm it fails**

```bash
npm test
```

Expected: FAIL. The `missing` array contains `app/layout.tsx -> /not-so-simple-og-1200x630.png` and `app/layout.tsx -> /notsosimple_logo_fixed_white_bg.png`. This is the pre-existing bug — do not fix it here; Task 10 generates the images. Confirm the test detects it, then move on.

- [ ] **Step 7: Temporarily mark the test as expected-to-fail**

So the suite stays green while the rest of the work proceeds, change `it(` to `it.fails(` on the assertion above and add this comment directly over it:

```ts
// TODO(Task 10): revert to `it(` once the OG images exist. Deliberately
// inverted so the suite stays green while sections are built out.
```

- [ ] **Step 8: Run and confirm green**

```bash
npm test
```

Expected: PASS (1 test).

- [ ] **Step 9: Commit**

```bash
git add package.json package-lock.json vitest.config.ts vitest.setup.ts tests/
git commit -m "test: add vitest harness and public asset guard"
```

---

## Task 2: Design Tokens and Typography

Replaces the color system and fonts. Ends with a site that builds and renders an empty page in the new palette.

**Files:**
- Modify: `app/globals.css`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`
- Delete: `styles/globals.css`

**Interfaces:**
- Produces: Tailwind classes `bg-paper`, `bg-paper-sunk`, `text-ink`, `text-ink-dim`, `text-ink-faint`, `border-rule`, `font-sans`, `font-serif`. Every later task uses these and must not introduce hex values.

- [ ] **Step 1: Replace `app/globals.css` entirely**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --paper: #f4f2ed;
  --paper-sunk: #ebe8e1;
  --ink: #14130f;
  --ink-dim: rgba(20, 19, 15, 0.58);
  --ink-faint: rgba(20, 19, 15, 0.44);
  --rule: rgba(20, 19, 15, 0.16);

  --on-ink: #f4f2ed;
  --on-ink-dim: rgba(244, 242, 237, 0.5);
  --on-ink-faint: rgba(244, 242, 237, 0.45);
  --rule-inverse: rgba(244, 242, 237, 0.25);
}

@layer base {
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply bg-paper text-ink antialiased;
  }
}

@layer components {
  .eyebrow {
    @apply text-[10.5px] uppercase tracking-[0.18em] text-ink-faint;
  }
}
```

The `--on-ink*` tokens exist for the inverted contact block in Task 9.

- [ ] **Step 2: Delete the orphaned stylesheet**

```bash
git rm styles/globals.css
```

It is 94 lines and imported nowhere — only `app/globals.css` is loaded, by `layout.tsx`.

- [ ] **Step 3: Replace `tailwind.config.ts` entirely**

The current config defines a full shadcn token set that nothing consumes.

```ts
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: { DEFAULT: "var(--paper)", sunk: "var(--paper-sunk)" },
        ink: {
          DEFAULT: "var(--ink)",
          dim: "var(--ink-dim)",
          faint: "var(--ink-faint)",
        },
        rule: "var(--rule)",
        "on-ink": {
          DEFAULT: "var(--on-ink)",
          dim: "var(--on-ink-dim)",
          faint: "var(--on-ink-faint)",
        },
        "rule-inverse": "var(--rule-inverse)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
      },
      maxWidth: { content: "920px" },
    },
  },
  plugins: [],
}
export default config
```

`darkMode` and `tailwindcss-animate` are both dropped — the site is light-only and the animation plugin was only needed by the shadcn components being deleted in Task 11.

- [ ] **Step 4: Rewrite `app/layout.tsx`**

Keep the existing `metadata` export exactly as it is for now — Task 10 rewrites it. Change only the fonts, the shell, and the `<html>`/`<body>` classes.

```tsx
import "./globals.css"
import type React from "react"
import { Inter, Instrument_Serif } from "next/font/google"
import type { Metadata } from "next"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
})

export const metadata: Metadata = {
  // unchanged in this task — rewritten in Task 10
  metadataBase: new URL("https://www.not-so-simple.com"),
  title: "Not So Simple, LLC",
  description:
    "We help startups and enterprises build software that scales — from architecture to implementation.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  )
}
```

Note what changed structurally: `className="dark"` is gone, the hardcoded `bg-[#0A0A0A] text-white` is gone (now handled by `globals.css`), and `Navigation`/`Footer` are no longer rendered here — Task 3 and Task 9 place them.

- [ ] **Step 5: Reduce `app/page.tsx` to a shell**

```tsx
export default function Home() {
  return <main />
}
```

The old 190-line client component is discarded. Sections get added back one task at a time.

- [ ] **Step 6: Verify the build**

```bash
npm run build
```

Expected: PASS. If `Instrument_Serif` fails to resolve, confirm the import name uses underscores — that is the `next/font/google` convention for multi-word families.

- [ ] **Step 7: Verify visually**

```bash
npm run dev
```

Open http://localhost:3000. Expected: a blank warm off-white page (`#F4F2ED`), not white and not black. Stop the server.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: replace color system and fonts with editorial tokens"
```

---

## Task 3: Navigation

**Files:**
- Create: `components/Nav.tsx`
- Delete: `components/Navigation.tsx`
- Modify: `app/page.tsx`
- Test: `tests/sections.test.tsx`

**Interfaces:**
- Consumes: Tailwind tokens from Task 2; `@/components/ui/sheet` (kept).
- Produces: `<Nav />`, default export. Anchor targets `#work`, `#approach`, `#contact` — later sections must use exactly these `id` values.

- [ ] **Step 1: Write the failing test**

Create `tests/sections.test.tsx`:

```tsx
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Nav from "@/components/Nav"

describe("Nav", () => {
  it("renders the wordmark and the three anchors", () => {
    render(<Nav />)
    expect(screen.getByText("Not So Simple")).toBeInTheDocument()
    const links = screen.getAllByRole("link")
    const hrefs = links.map((l) => l.getAttribute("href"))
    expect(hrefs).toContain("#work")
    expect(hrefs).toContain("#approach")
    expect(hrefs).toContain("#contact")
  })
})
```

- [ ] **Step 2: Run and confirm it fails**

```bash
npm test
```

Expected: FAIL — `Cannot find module '@/components/Nav'`.

- [ ] **Step 3: Create `components/Nav.tsx`**

Smooth scrolling now comes from `scroll-behavior: smooth` in `globals.css`, so the JS scroll handlers in the old `Navigation.tsx` are gone. The component is still a client component because the mobile sheet needs state.

```tsx
"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const items = [
  { href: "#work", label: "Work" },
  { href: "#approach", label: "Approach" },
  { href: "#contact", label: "Contact" },
]

export default function Nav() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-rule bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-content items-baseline justify-between px-6 py-4 md:px-14">
        <a href="#top" className="font-serif text-[19px] tracking-[-0.02em]">
          Not So Simple
        </a>

        <nav className="hidden items-baseline gap-7 md:flex">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[13px] text-ink-dim transition-colors hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] border-rule bg-paper">
            <nav className="mt-10 flex flex-col gap-5">
              {items.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="font-serif text-2xl text-ink"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Run and confirm it passes**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 5: Mount it in `app/page.tsx`**

```tsx
import Nav from "@/components/Nav"

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top" />
    </>
  )
}
```

- [ ] **Step 6: Delete the old navigation**

```bash
git rm components/Navigation.tsx
```

- [ ] **Step 7: Verify**

```bash
npm test && npm run build
```

Expected: both PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add editorial navigation, remove v0 Navigation"
```

---

## Task 4: Hero

**Files:**
- Create: `components/Hero.tsx`
- Modify: `app/page.tsx`, `tests/sections.test.tsx`
- Delete: `public/hero-image.png`

**Interfaces:**
- Produces: `<Hero />`, default export. No props.

- [ ] **Step 1: Add the failing test**

Append to `tests/sections.test.tsx`:

```tsx
import Hero from "@/components/Hero"

describe("Hero", () => {
  it("renders the positioning copy and both calls to action", () => {
    render(<Hero />)
    expect(
      screen.getByText(/The simple version of the problem is rarely the one that ships/)
    ).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /Get in touch/ })).toHaveAttribute(
      "href",
      "#contact"
    )
    expect(screen.getByRole("link", { name: /See the work/ })).toHaveAttribute(
      "href",
      "#work"
    )
  })
})
```

- [ ] **Step 2: Run and confirm it fails**

```bash
npm test
```

Expected: FAIL — module not found.

- [ ] **Step 3: Create `components/Hero.tsx`**

Copy is verbatim from the spec. Note `&#8209;` is a non-breaking hyphen, used so "full-stack" never breaks across lines.

```tsx
export default function Hero() {
  return (
    <section className="mx-auto max-w-content px-6 pb-16 pt-32 md:px-14 md:pb-24 md:pt-40">
      <p className="eyebrow mb-8 md:mb-11">Software Consulting</p>

      <h1 className="font-serif text-[15vw] leading-[0.92] tracking-[-0.02em] sm:text-[64px] md:text-[92px]">
        Not so
        <br />
        simple.
      </h1>

      <div className="mt-10 grid items-end gap-8 md:mt-13 md:grid-cols-2 md:gap-14">
        <p className="text-[17px] leading-[1.65] text-ink-dim">
          The simple version of the problem is rarely the one that ships. I do
          architecture and full&#8209;stack engineering for teams building
          systems that have to hold up once the edge cases show up.
        </p>

        <div className="flex items-center gap-7 md:justify-end">
          <a
            href="#contact"
            className="border-b-[1.5px] border-ink pb-0.5 text-sm font-medium"
          >
            Get in touch &rarr;
          </a>
          <a
            href="#work"
            className="border-b border-rule pb-0.5 text-sm text-ink-dim transition-colors hover:text-ink"
          >
            See the work
          </a>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run and confirm it passes**

```bash
npm test
```

Expected: PASS.

- [ ] **Step 5: Mount it**

In `app/page.tsx`, import `Hero` and render `<Hero />` inside `<main id="top">`.

- [ ] **Step 6: Delete the stock illustration**

```bash
git rm public/hero-image.png
```

- [ ] **Step 7: Verify**

```bash
npm test && npm run build
```

Then `npm run dev` and confirm at http://localhost:3000 that the headline is serif, roughly 92px on a desktop viewport, and does not overflow at 375px width. Stop the server.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add editorial hero, drop stock illustration"
```

---

## Task 5: Approach

**Files:**
- Create: `components/Approach.tsx`
- Modify: `app/page.tsx`, `tests/sections.test.tsx`

**Interfaces:**
- Produces: `<Approach />`, default export. Renders `<section id="approach">` — Nav depends on this id.

- [ ] **Step 1: Add the failing test**

```tsx
import Approach from "@/components/Approach"

describe("Approach", () => {
  it("renders three numbered rows with their titles", () => {
    const { container } = render(<Approach />)
    expect(container.querySelector("#approach")).toBeInTheDocument()
    expect(screen.getByText("Software architecture")).toBeInTheDocument()
    expect(screen.getByText(/Full.?stack development/)).toBeInTheDocument()
    expect(screen.getByText("Technical consulting")).toBeInTheDocument()
    for (const n of ["01", "02", "03"]) {
      expect(screen.getByText(n)).toBeInTheDocument()
    }
  })
})
```

- [ ] **Step 2: Run and confirm it fails**

```bash
npm test
```

- [ ] **Step 3: Create `components/Approach.tsx`**

```tsx
const rows = [
  {
    n: "01",
    title: "Software architecture",
    body: "Systems designed to survive their second year. Data models, service boundaries, and the handful of decisions that get expensive to reverse later.",
  },
  {
    n: "02",
    title: "Full‑stack development",
    body: "Shipped product, not prototypes. Front to back, including the deploys, migrations, and monitoring that decide whether it actually works in the world.",
  },
  {
    n: "03",
    title: "Technical consulting",
    body: "A straight second opinion. Build‑versus‑buy, stack choices, and an honest read on what's actually slowing the team down.",
  },
]

export default function Approach() {
  return (
    <section
      id="approach"
      className="mx-auto max-w-content border-t border-rule px-6 py-16 md:px-14 md:py-20"
    >
      <p className="eyebrow mb-3">Approach</p>
      <h2 className="mb-10 max-w-[11em] font-serif text-[34px] leading-[1.05] tracking-[-0.02em] md:mb-14 md:text-[44px]">
        Three ways I&rsquo;m usually useful.
      </h2>

      <dl>
        {rows.map((row, i) => (
          <div
            key={row.n}
            className={`grid gap-4 border-t border-rule py-7 md:grid-cols-[64px_1.1fr_1.4fr] md:gap-8 ${
              i === rows.length - 1 ? "border-b" : ""
            }`}
          >
            <span className="font-serif text-xl text-ink-faint">{row.n}</span>
            <dt className="text-xl font-medium tracking-[-0.015em]">
              {row.title}
            </dt>
            <dd className="text-[15px] leading-[1.65] text-ink-dim">
              {row.body}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
```

- [ ] **Step 4: Run and confirm it passes**

```bash
npm test
```

- [ ] **Step 5: Mount it**

Import and render `<Approach />` after `<Hero />` in `app/page.tsx`.

- [ ] **Step 6: Verify**

```bash
npm test && npm run build
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add approach section replacing service cards"
```

---

## Task 6: Selected Work

Includes replacing the two hotlinked Vercel-blob screenshots with self-hosted captures.

> ### AUTHORIZED AMENDMENT (2026-07-29) — supersedes the steps below where they conflict
>
> **`athena.foo` does not resolve.** Verified independently: no A record from
> Google's resolver for either `athena.foo` or `www.athena.foo`, and `curl`
> returns `000` on both. `bankfinder.us` resolves and returns 200. Athena is
> not reachable, cannot be screenshotted, and must not be linked or described
> as live.
>
> The project owner ruled: **keep the Athena entry, but with no link and no
> "Live" claim.** Concretely, superseding the steps below:
>
> 1. **Step 1 captures one screenshot, not two.** Capture only
>    `https://bankfinder.us` to `public/work-bankfinder.png`. Do not create
>    `public/work-athena.png` — no placeholder, no substitute image.
> 2. **Athena's eyebrow is `"Crypto"`,** not `"Crypto / Live"`.
> 3. **Athena has no `href`, no link label, and no image.** Its entry renders
>    full-width with a top hairline rule instead of the two-column
>    text-plus-image layout. Its body copy is unchanged from Step 4.
> 4. **The component must handle both shapes** — an entry with an image and
>    link, and an entry with neither. Use the replacement component and tests
>    given at the end of this task, under "Amended code".

**Files:**
- Create: `components/SelectedWork.tsx`, `public/work-bankfinder.png`
- Modify: `app/page.tsx`, `tests/sections.test.tsx`

**Interfaces:**
- Produces: `<SelectedWork />`, default export. Renders `<section id="work">`.

- [ ] **Step 1: Capture the screenshots**

Both sites are live. Capture each at 1440×1080 viewport, then downscale to 1200×900 (4:3).

Using the Chrome browser tools available in this session: open `https://bankfinder.us` in a new tab, screenshot it, and save to `public/work-bankfinder.png`; repeat for `https://www.athena.foo` to `public/work-athena.png`.

If browser tooling is unavailable, fall back to:

```bash
npx --yes playwright@latest install chromium
npx --yes playwright screenshot --viewport-size=1440,1080 \
  https://bankfinder.us public/work-bankfinder.png
npx --yes playwright screenshot --viewport-size=1440,1080 \
  https://www.athena.foo public/work-athena.png
```

Then normalize both:

```bash
sips -z 900 1200 public/work-bankfinder.png --out public/work-bankfinder.png
sips -z 900 1200 public/work-athena.png --out public/work-athena.png
ls -lh public/work-*.png
```

Each should land well under 500KB. If either exceeds that, re-save as JPEG at quality 80 and update the paths in the component.

- [ ] **Step 2: Add the failing test**

```tsx
import SelectedWork from "@/components/SelectedWork"

describe("SelectedWork", () => {
  it("renders both projects with correct links and current descriptions", () => {
    const { container } = render(<SelectedWork />)
    expect(container.querySelector("#work")).toBeInTheDocument()

    expect(screen.getByRole("link", { name: /bankfinder\.us/i })).toHaveAttribute(
      "href",
      "https://bankfinder.us"
    )
    expect(screen.getByRole("link", { name: /athena\.foo/i })).toHaveAttribute(
      "href",
      "https://www.athena.foo"
    )

    // Athena's old copy described a Web3 security/TGE-alerts product.
    // That was factually wrong; guard against regression.
    expect(screen.queryByText(/TGE/i)).not.toBeInTheDocument()
    expect(screen.getByText(/blockchain transaction history/i)).toBeInTheDocument()
  })

  it("serves screenshots locally, never from remote blob storage", () => {
    const { container } = render(<SelectedWork />)
    for (const img of Array.from(container.querySelectorAll("img"))) {
      expect(img.getAttribute("src")).toMatch(/^\/work-/)
    }
  })
})
```

- [ ] **Step 3: Run and confirm it fails**

```bash
npm test
```

- [ ] **Step 4: Create `components/SelectedWork.tsx`**

```tsx
import Image from "next/image"

const projects = [
  {
    eyebrow: "Fintech / Live",
    title: "BankFinder.us",
    body: "Most people never switch banks because comparing them is miserable. BankFinder puts modern banking alternatives side by side, so finding a better account takes minutes instead of an afternoon.",
    href: "https://bankfinder.us",
    label: "bankfinder.us",
    image: "/work-bankfinder.png",
  },
  {
    eyebrow: "Crypto / Live",
    title: "Athena",
    body: "On‑chain activity breaks conventional bookkeeping. Athena applies AI to blockchain transaction history and turns it into accounting records a human can actually file taxes from.",
    href: "https://www.athena.foo",
    label: "athena.foo",
    image: "/work-athena.png",
  },
]

export default function SelectedWork() {
  return (
    <section id="work" className="bg-paper-sunk">
      <div className="mx-auto max-w-content px-6 py-16 md:px-14 md:py-20">
        <p className="eyebrow mb-3">Selected Work</p>
        <h2 className="mb-12 font-serif text-[34px] leading-[1.05] tracking-[-0.02em] md:mb-14 md:text-[44px]">
          Two things worth showing.
        </h2>

        <div className="flex flex-col gap-14 md:gap-16">
          {projects.map((project, i) => (
            <article
              key={project.title}
              className="grid items-center gap-8 md:grid-cols-2 md:gap-11"
            >
              <div className={i % 2 === 1 ? "md:order-2" : undefined}>
                <p className="eyebrow mb-3.5">{project.eyebrow}</p>
                <h3 className="mb-3.5 font-serif text-[34px] tracking-[-0.02em]">
                  {project.title}
                </h3>
                <p className="mb-5 text-[15px] leading-[1.65] text-ink-dim">
                  {project.body}
                </p>
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-b-[1.5px] border-ink pb-0.5 text-[13.5px] font-medium"
                >
                  {project.label} &nearr;
                </a>
              </div>

              <Image
                src={project.image}
                alt={`${project.title} homepage`}
                width={1200}
                height={900}
                className={`aspect-[4/3] w-full border border-rule object-cover ${
                  i % 2 === 1 ? "md:order-1" : ""
                }`}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Run and confirm it passes**

```bash
npm test
```

Expected: PASS, including the asset-existence guard from Task 1 now that both screenshots are on disk.

- [ ] **Step 6: Mount it**

Import and render `<SelectedWork />` after `<Approach />` in `app/page.tsx`.

- [ ] **Step 7: Verify**

```bash
npm test && npm run build
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add selected work with self-hosted screenshot and accurate copy"
```

### Amended code

These replace the component in Step 4 and the tests in Step 2.

`components/SelectedWork.tsx`:

```tsx
import Image from "next/image"

const projects = [
  {
    eyebrow: "Fintech / Live",
    title: "BankFinder.us",
    body: "Most people never switch banks because comparing them is miserable. BankFinder puts modern banking alternatives side by side, so finding a better account takes minutes instead of an afternoon.",
    href: "https://bankfinder.us",
    label: "bankfinder.us",
    image: "/work-bankfinder.png",
  },
  {
    eyebrow: "Crypto",
    title: "Athena",
    body: "On‑chain activity breaks conventional bookkeeping. Athena applies AI to blockchain transaction history and turns it into accounting records a human can actually file taxes from.",
    href: null,
    label: null,
    image: null,
  },
]

export default function SelectedWork() {
  return (
    <section id="work" className="bg-paper-sunk">
      <div className="mx-auto max-w-content px-6 py-16 md:px-14 md:py-20">
        <p className="eyebrow mb-3">Selected Work</p>
        <h2 className="mb-12 font-serif text-[34px] leading-[1.05] tracking-[-0.02em] md:mb-14 md:text-[44px]">
          Two things worth showing.
        </h2>

        <div className="flex flex-col gap-14 md:gap-16">
          {projects.map((project, i) => (
            <article
              key={project.title}
              className={
                project.image
                  ? "grid items-center gap-8 md:grid-cols-2 md:gap-11"
                  : "border-t border-rule pt-9"
              }
            >
              <div
                className={
                  project.image && i % 2 === 1 ? "md:order-2" : undefined
                }
              >
                <p className="eyebrow mb-3.5">{project.eyebrow}</p>
                <h3 className="mb-3.5 font-serif text-[34px] tracking-[-0.02em]">
                  {project.title}
                </h3>
                <p className="max-w-[46em] text-[15px] leading-[1.65] text-ink-dim">
                  {project.body}
                </p>
                {project.href && (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-block border-b-[1.5px] border-ink pb-0.5 text-[13.5px] font-medium"
                  >
                    {project.label} &nearr;
                  </a>
                )}
              </div>

              {project.image && (
                <Image
                  src={project.image}
                  alt={`${project.title} homepage`}
                  width={1200}
                  height={900}
                  className={`aspect-[4/3] w-full border border-rule object-cover ${
                    i % 2 === 1 ? "md:order-1" : ""
                  }`}
                />
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
```

Tests appended to `tests/sections.test.tsx`:

```tsx
import SelectedWork from "@/components/SelectedWork"

describe("SelectedWork", () => {
  it("renders both projects with current descriptions", () => {
    const { container } = render(<SelectedWork />)
    expect(container.querySelector("#work")).toBeInTheDocument()
    expect(screen.getByText("BankFinder.us")).toBeInTheDocument()
    expect(screen.getByText("Athena")).toBeInTheDocument()

    // Athena's old copy described a Web3 security/TGE-alerts product.
    // That was factually wrong; guard against regression.
    expect(screen.queryByText(/TGE/i)).not.toBeInTheDocument()
    expect(screen.getByText(/blockchain transaction history/i)).toBeInTheDocument()
  })

  it("links BankFinder but never links the unreachable Athena domain", () => {
    const { container } = render(<SelectedWork />)
    expect(screen.getByRole("link", { name: /bankfinder\.us/i })).toHaveAttribute(
      "href",
      "https://bankfinder.us"
    )
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) =>
      a.getAttribute("href")
    )
    expect(hrefs.some((h) => h?.includes("athena"))).toBe(false)
  })

  it("does not claim Athena is live", () => {
    render(<SelectedWork />)
    expect(screen.getByText("Crypto")).toBeInTheDocument()
    expect(screen.queryByText(/Crypto \/ Live/)).not.toBeInTheDocument()
  })

  it("serves every screenshot locally, never from remote blob storage", () => {
    const { container } = render(<SelectedWork />)
    const imgs = Array.from(container.querySelectorAll("img"))
    expect(imgs).toHaveLength(1)
    for (const img of imgs) {
      expect(img.getAttribute("src")).toMatch(/^\/work-/)
    }
  })
})
```

---

## Task 7: Bio

**Files:**
- Create: `components/Bio.tsx`
- Modify: `app/page.tsx`, `tests/sections.test.tsx`

**Interfaces:**
- Produces: `<Bio />`, default export. Uses `public/jack-wolfe.jpg` (already committed at `5f78ecf`).

- [ ] **Step 1: Add the failing test**

The employer-name assertion is a guard on an explicit constraint, not a stylistic preference.

```tsx
import Bio from "@/components/Bio"

describe("Bio", () => {
  it("renders the name, both domain figures, and the location", () => {
    render(<Bio />)
    expect(screen.getByText("Jack Wolfe III")).toBeInTheDocument()
    expect(screen.getByText("05")).toBeInTheDocument()
    expect(screen.getByText("06")).toBeInTheDocument()
    expect(screen.getByText(/Streetsboro, Ohio/)).toBeInTheDocument()
  })

  it("names no employer", () => {
    const { container } = render(<Bio />)
    const text = container.textContent ?? ""
    for (const forbidden of ["NASA", "Fifth Third", "Undertime"]) {
      expect(text).not.toContain(forbidden)
    }
  })
})
```

- [ ] **Step 2: Run and confirm it fails**

```bash
npm test
```

- [ ] **Step 3: Create `components/Bio.tsx`**

The `filter` on the image is the warm-monochrome grade chosen during design. It is applied in CSS so the source file stays unmodified and the grade stays adjustable.

```tsx
import Image from "next/image"

export default function Bio() {
  return (
    <section className="mx-auto max-w-content px-6 py-16 md:px-14 md:py-20">
      <p className="eyebrow mb-8 md:mb-11">Who&rsquo;s Behind It</p>

      <div className="grid gap-9 md:grid-cols-[300px_1fr] md:gap-13">
        <Image
          src="/jack-wolfe.jpg"
          alt="Jack Wolfe III"
          width={324}
          height={405}
          className="aspect-[4/5] w-full max-w-[300px] border border-rule object-cover [filter:grayscale(1)_sepia(0.28)_contrast(1.06)_brightness(1.05)]"
        />

        <div>
          <h2 className="mb-5 font-serif text-[38px] tracking-[-0.02em]">
            Jack Wolfe III
          </h2>

          <p className="mb-4 text-base leading-[1.65] text-ink-dim">
            Eleven years building production software: five in aerospace, six in
            finance. Two fields that agree on very little except the important
            part &mdash; the edge cases aren&rsquo;t hypothetical, and
            &ldquo;mostly correct&rdquo; isn&rsquo;t a state you&rsquo;re
            allowed to ship in.
          </p>

          <p className="text-base leading-[1.65] text-ink-dim">
            Not So Simple is where that experience goes to work for other teams.
            The name is the whole thesis: the problems worth hiring someone for
            are the ones without a clean answer, and pretending otherwise is how
            projects get expensive.
          </p>

          <dl className="mt-8 flex border-t border-rule">
            <div className="flex-[5] border-r border-rule pr-5 pt-3.5">
              <dd className="font-serif text-2xl leading-none">05</dd>
              <dt className="eyebrow mt-1.5">Years / Aerospace</dt>
            </div>
            <div className="flex-[6] pl-5 pt-3.5">
              <dd className="font-serif text-2xl leading-none">06</dd>
              <dt className="eyebrow mt-1.5">Years / Finance</dt>
            </div>
          </dl>

          <p className="mt-6 text-[13.5px] text-ink-dim">Streetsboro, Ohio</p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run and confirm it passes**

```bash
npm test
```

- [ ] **Step 5: Mount it**

Import and render `<Bio />` after `<SelectedWork />` in `app/page.tsx`.

- [ ] **Step 6: Verify visually**

`npm run dev`, then confirm the headshot renders in warm monochrome rather than full color, and that the 05/06 strip sits on a hairline rule. Stop the server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add bio section with warm monochrome headshot"
```

---

## Task 8: Contact Form Rewrite

The current form has three real defects: it submits with an empty `access_key` when the env var is missing, it decides success by substring-matching `"error"` in the API response text, and it has no validation beyond the `required` attribute.

**Files:**
- Modify: `components/ContactForm.tsx`
- Test: `tests/ContactForm.test.tsx`

**Interfaces:**
- Produces: `<ContactForm />`, default export. Internal state is `"idle" | "submitting" | "success" | "error"`.

- [ ] **Step 1: Write the failing tests**

Create `tests/ContactForm.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ContactForm from "@/components/ContactForm"

const fill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/name/i), "Ada Lovelace")
  await user.type(screen.getByLabelText(/email/i), "ada@example.com")
  await user.type(screen.getByLabelText(/working on/i), "A difference engine.")
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY", "test-key")
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe("ContactForm", () => {
  it("rejects a malformed email without calling the API", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/name/i), "Ada")
    await user.type(screen.getByLabelText(/email/i), "not-an-email")
    await user.type(screen.getByLabelText(/working on/i), "Hello.")
    await user.click(screen.getByRole("button", { name: /send/i }))

    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("shows a confirmation and clears the fields on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) })
    )
    const user = userEvent.setup()
    render(<ContactForm />)
    await fill(user)
    await user.click(screen.getByRole("button", { name: /send/i }))

    expect(await screen.findByText(/Thanks/i)).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByLabelText(/name/i)).toHaveValue("")
    )
  })

  it("surfaces a readable error when the API rejects", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ success: false }) })
    )
    const user = userEvent.setup()
    render(<ContactForm />)
    await fill(user)
    await user.click(screen.getByRole("button", { name: /send/i }))

    expect(await screen.findByText(/didn't go through/i)).toBeInTheDocument()
  })

  it("does not call the API when the access key is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY", "")
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<ContactForm />)
    await fill(user)
    await user.click(screen.getByRole("button", { name: /send/i }))

    expect(await screen.findByText(/email me directly/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run and confirm they fail**

```bash
npm test
```

Expected: FAIL — the current form has no labels, so `getByLabelText` cannot find the fields.

- [ ] **Step 3: Rewrite `components/ContactForm.tsx`**

```tsx
"use client"

import { useState } from "react"

type Status = "idle" | "submitting" | "success" | "error"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const field =
  "w-full border-0 border-b border-rule-inverse bg-transparent pb-2.5 text-[13px] text-on-ink placeholder:text-on-ink-dim focus:border-on-ink focus:outline-none focus:ring-0"

export default function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" })
  const [status, setStatus] = useState<Status>("idle")
  const [feedback, setFeedback] = useState("")

  const set = (key: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setValues({ ...values, [key]: e.target.value })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!EMAIL_RE.test(values.email)) {
      setStatus("error")
      setFeedback("That doesn't look like a valid email address.")
      return
    }

    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
    if (!accessKey) {
      setStatus("error")
      setFeedback("The form isn't configured right now — email me directly at jack@not-so-simple.com.")
      return
    }

    setStatus("submitting")
    setFeedback("")

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: "New enquiry from not-so-simple.com",
          name: values.name,
          email: values.email,
          message: values.message,
        }),
      })

      const json = await response.json().catch(() => ({}))

      if (!response.ok || json?.success === false) {
        throw new Error("submission rejected")
      }

      setStatus("success")
      setFeedback("Thanks — that came through. I'll get back to you.")
      setValues({ name: "", email: "", message: "" })
    } catch {
      setStatus("error")
      setFeedback("That didn't go through. Try again, or email jack@not-so-simple.com.")
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="sr-only">
            Name
          </label>
          <input
            id="name"
            name="name"
            placeholder="Name"
            value={values.name}
            onChange={set("name")}
            required
            className={field}
          />
        </div>
        <div>
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            value={values.email}
            onChange={set("email")}
            required
            className={field}
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="sr-only">
          What are you working on?
        </label>
        <textarea
          id="message"
          name="message"
          placeholder="What are you working on?"
          value={values.message}
          onChange={set("message")}
          required
          rows={3}
          className={`${field} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-2 self-start rounded-sm bg-on-ink px-6 py-2.5 text-[13.5px] font-medium text-ink transition-opacity disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send"}
      </button>

      {feedback && (
        <p
          role="status"
          className={`text-[13px] ${
            status === "error" ? "text-on-ink" : "text-on-ink-dim"
          }`}
        >
          {feedback}
        </p>
      )}
    </form>
  )
}
```

Note the switch from `FormData` to a JSON body — Web3Forms accepts both, and JSON makes the request shape explicit and testable.

- [ ] **Step 4: Run and confirm they pass**

```bash
npm test
```

Expected: PASS, all four ContactForm tests.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "fix: rewrite contact form with validation and explicit states"
```

---

## Task 9: Contact Section and Footer

The page inverts here. The footer lives inside the same dark block.

**Files:**
- Create: `components/Contact.tsx`
- Delete: `components/Footer.tsx`
- Modify: `app/page.tsx`, `tests/sections.test.tsx`

**Interfaces:**
- Consumes: `<ContactForm />` from Task 8.
- Produces: `<Contact />`, default export. Renders `<section id="contact">`.

- [ ] **Step 1: Add the failing test**

```tsx
import Contact from "@/components/Contact"

describe("Contact", () => {
  it("renders a mailto link to the real address", () => {
    render(<Contact />)
    expect(
      screen.getByRole("link", { name: /jack@not-so-simple\.com/ })
    ).toHaveAttribute("href", "mailto:jack@not-so-simple.com")
  })

  it("renders the footer without dead links", () => {
    const { container } = render(<Contact />)
    expect(screen.getByText(/Not So Simple, LLC/)).toBeInTheDocument()
    const dead = Array.from(container.querySelectorAll("a")).filter(
      (a) => a.getAttribute("href") === "#"
    )
    expect(dead).toEqual([])
  })
})
```

- [ ] **Step 2: Run and confirm it fails**

```bash
npm test
```

- [ ] **Step 3: Create `components/Contact.tsx`**

Privacy Policy and Terms of Service are removed rather than restyled — both pointed at `#`, and a dead link is worse than no link on a one-page site that collects nothing beyond a contact form.

```tsx
import ContactForm from "@/components/ContactForm"

export default function Contact() {
  const year = new Date().getFullYear()

  return (
    <section id="contact" className="bg-ink text-on-ink">
      <div className="mx-auto max-w-content px-6 py-16 md:px-14 md:py-20">
        <p className="eyebrow mb-8 text-on-ink-faint">Contact</p>

        <h2 className="mb-8 font-serif text-[38px] leading-[1.05] tracking-[-0.02em] md:text-[52px]">
          Got something that isn&rsquo;t&nbsp;simple?
        </h2>

        <a
          href="mailto:jack@not-so-simple.com"
          className="inline-block border-b border-rule-inverse pb-1.5 font-serif text-[26px] transition-colors hover:border-on-ink md:text-[38px]"
        >
          jack@not-so-simple.com
        </a>

        <div className="mt-14 grid gap-9 border-t border-rule-inverse pt-11 md:grid-cols-[0.85fr_1.15fr] md:gap-13">
          <p className="text-sm leading-[1.65] text-on-ink-dim">
            Prefer to write it out? The form goes to the same inbox.
          </p>
          <ContactForm />
        </div>

        <footer className="mt-16 flex flex-col gap-2 border-t border-rule-inverse pt-7 text-[12.5px] text-on-ink-dim sm:flex-row sm:justify-between">
          <span>&copy; {year} Not So Simple, LLC</span>
          <span>Streetsboro, Ohio</span>
        </footer>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run and confirm it passes**

```bash
npm test
```

- [ ] **Step 5: Mount it and delete the old footer**

Import and render `<Contact />` after `<Bio />` in `app/page.tsx`. Then:

```bash
git rm components/Footer.tsx
```

- [ ] **Step 6: Confirm `app/page.tsx` is now complete**

It should read exactly:

```tsx
import Nav from "@/components/Nav"
import Hero from "@/components/Hero"
import Approach from "@/components/Approach"
import SelectedWork from "@/components/SelectedWork"
import Bio from "@/components/Bio"
import Contact from "@/components/Contact"

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <Approach />
        <SelectedWork />
        <Bio />
        <Contact />
      </main>
    </>
  )
}
```

No `"use client"` — the page is a server component now.

- [ ] **Step 7: Verify**

```bash
npm test && npm run build
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add inverted contact section with footer, remove dead links"
```

---

## Task 10: Metadata and Social Images

Fixes the broken link previews and flips the Task 1 guard back to a real assertion.

**Files:**
- Create: `public/og-1200x630.png`
- Modify: `app/layout.tsx`, `tests/assets.test.ts`
- Delete: `public/placeholder*.{svg,png,jpg}`

- [ ] **Step 1: Generate the OpenGraph image**

Create a 1200×630 PNG in the editorial system: paper background `#F4F2ED`, "Not so simple." set in Instrument Serif in ink `#14130F` at roughly 150px, left-aligned with ~90px margins, and a small uppercase "SOFTWARE CONSULTING" eyebrow above it in `rgba(20,19,15,0.44)`.

Build it as a standalone HTML file matching those specs and screenshot it at exactly 1200×630, or compose it directly — either is fine as long as the output is 1200×630 and visually consistent with the site. Save to `public/og-1200x630.png`.

Verify:

```bash
sips -g pixelWidth -g pixelHeight public/og-1200x630.png
```

Expected: 1200 × 630.

- [ ] **Step 2: Rewrite the metadata block in `app/layout.tsx`**

Replaces the description (which still says "we help startups and enterprises", inconsistent with the one-person framing everywhere else) and points every image at a file that exists. The single OG image is reused for Twitter.

```tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://www.not-so-simple.com"),
  title: "Not So Simple, LLC",
  description:
    "Software consulting from Jack Wolfe III — architecture and full-stack engineering for teams building systems that have to hold up.",
  icons: {
    icon: [
      { url: "/favicon.ico", rel: "shortcut icon" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  appleWebApp: { title: "Not So Simple, LLC" },
  openGraph: {
    title: "Not So Simple, LLC",
    description:
      "Software consulting from Jack Wolfe III — architecture and full-stack engineering for teams building systems that have to hold up.",
    url: "https://www.not-so-simple.com",
    siteName: "Not So Simple, LLC",
    images: [
      { url: "/og-1200x630.png", width: 1200, height: 630, alt: "Not So Simple, LLC" },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Not So Simple, LLC",
    description: "Software consulting — architecture and full-stack engineering.",
    images: ["/og-1200x630.png"],
  },
}
```

- [ ] **Step 3: Restore the asset guard**

In `tests/assets.test.ts`, change `it.fails(` back to `it(` and delete the `TODO(Task 10)` comment.

- [ ] **Step 4: Run and confirm it passes for real**

```bash
npm test
```

Expected: PASS. If it fails, an asset path in `layout.tsx` is still wrong — the guard is doing its job; fix the path.

- [ ] **Step 5: Delete unused placeholder assets**

```bash
git rm public/placeholder.svg public/placeholder.jpg public/placeholder-logo.svg \
       public/placeholder-logo.png public/placeholder-user.jpg
```

- [ ] **Step 6: Verify**

```bash
npm test && npm run build
```

Then confirm the built output actually contains the OG tag:

```bash
grep -r "og-1200x630" .next/server/app/index.html 2>/dev/null || \
  (npm run dev & sleep 6 && curl -s http://localhost:3000 | grep -o 'og:image[^>]*' ; kill %1)
```

Expected: the `og:image` meta tag resolves to `/og-1200x630.png`.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "fix: repair broken OG and Twitter images, refresh metadata"
```

---

## Task 11: Prune Dependencies and Build Config

**Files:**
- Modify: `package.json`, `next.config.mjs`
- Delete: 46 of 50 files in `components/ui/`, plus `components/theme-provider.tsx`, `hooks/`

- [ ] **Step 1: Confirm which UI components are actually used**

```bash
grep -rhoE "@/components/ui/[a-z-]+" app components | sort -u
```

Expected output: `button`, `sheet`. Task 8's form uses raw `<input>`/`<textarea>` elements, so `input.tsx` and `textarea.tsx` are no longer needed either.

If the output lists anything beyond `button` and `sheet`, keep those too and adjust the deletion below accordingly.

- [ ] **Step 2: Delete every unused UI component**

```bash
cd components/ui
ls | grep -vE "^(button|sheet)\.tsx$" | xargs git rm
cd ../..
git rm -r components/theme-provider.tsx hooks components/ui/use-mobile.tsx components/ui/use-toast.ts 2>/dev/null || true
```

- [ ] **Step 3: Confirm nothing broke**

```bash
npm test && npm run build
```

Expected: both PASS. If the build reports a missing module, that component was in use — restore it with `git checkout HEAD -- components/ui/<name>.tsx`.

- [ ] **Step 4: Remove orphaned dependencies**

```bash
npm uninstall \
  @hookform/resolvers @radix-ui/react-accordion @radix-ui/react-alert-dialog \
  @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox \
  @radix-ui/react-collapsible @radix-ui/react-context-menu \
  @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label \
  @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover \
  @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area \
  @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slider \
  @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast \
  @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip \
  cmdk date-fns embla-carousel-react input-otp next-themes react-day-picker \
  react-hook-form react-resizable-panels recharts sonner vaul zod \
  tailwindcss-animate
```

`@radix-ui/react-dialog` and `@radix-ui/react-slot` stay — Sheet depends on Dialog, Button on Slot. `lucide-react`, `clsx`, `class-variance-authority`, and `tailwind-merge` also stay.

- [ ] **Step 5: Rename the package**

In `package.json`, change `"name": "my-v0-project"` to `"name": "not-so-simple-llc"`.

- [ ] **Step 6: Replace `next.config.mjs` entirely**

The current file imports `./v0-user-next.config`, which does not exist, and swallows the failure in a bare `catch`. It also disables type and lint checking at build time — meaning type errors ship silently.

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { unoptimized: true },
}

export default nextConfig
```

`images.unoptimized` is retained deliberately: the site is statically hosted and all images are pre-sized. The `experimental` block is dropped — those flags were v0 scaffolding, not requirements.

- [ ] **Step 7: Verify with type checking now enabled**

```bash
npm test && npm run build
```

Expected: both PASS. This is the first build that actually type-checks. If real type errors surface, fix them — do not re-add `ignoreBuildErrors`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: prune unused shadcn kit and deps, restore type checking"
```

---

## Task 12: Responsive Audit and Final Verification

**Files:** whichever the audit turns up. No new files expected.

- [ ] **Step 1: Full suite and clean build**

```bash
rm -rf .next
npm test && npm run build
```

Expected: all tests PASS, build succeeds with no warnings about missing modules.

- [ ] **Step 2: Check every viewport**

```bash
npm run dev
```

At http://localhost:3000, check **375px**, **768px**, and **1440px**. Confirm at each:

- The hero headline does not overflow horizontally or clip descenders.
- The Approach rows stack readably at 375px (the 3-column grid collapses below `md`).
- Selected Work alternation only applies at `md` and above; at 375px each project reads text-then-image.
- The Bio photo does not exceed 300px wide and sits above the text at 375px.
- The contact form's two-up name/email row collapses to one column below `sm`.
- No horizontal scrollbar at any width.

Fix anything that fails, then re-run `npm test && npm run build`.

- [ ] **Step 3: Verify the constraints hold repo-wide**

```bash
grep -ri "7F62F4" app components tailwind.config.ts && echo "FAIL: purple survives" || echo "ok: no purple"
grep -ri "undertime" app components public docs && echo "FAIL: undertime referenced" || echo "ok"
grep -rn "hebbkx1anhila5yf" app components && echo "FAIL: blob hotlink survives" || echo "ok"
grep -rniE "nasa|fifth third" app components && echo "FAIL: employer named" || echo "ok"
grep -rn 'href="#"' app components && echo "FAIL: dead link" || echo "ok"
```

Expected: five `ok` lines. `docs/` legitimately discusses these terms in the spec — restrict the greps to `app components public` as written above.

- [ ] **Step 4: Verify both project links resolve**

```bash
curl -s -o /dev/null -w "bankfinder %{http_code}\n" -L https://bankfinder.us
curl -s -o /dev/null -w "athena %{http_code}\n" -L https://www.athena.foo
```

Expected: `200` for both. If either fails, the link is broken and the section must not ship claiming it is live.

- [ ] **Step 5: Verify the contact form end to end**

With `npm run dev` running and a real `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` in `.env.local`, submit the form once and confirm the message arrives in the destination inbox. Then temporarily blank the env var, restart, and confirm the form shows the "email me directly" fallback instead of failing silently.

- [ ] **Step 6: Commit anything the audit changed**

```bash
git add -A
git commit -m "fix: responsive corrections from full-viewport audit"
```

- [ ] **Step 7: Push the branch**

```bash
git push -u origin feature/site-refresh
```

Do not merge to `main` — the site owner reviews the deployed preview first.

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| Palette tokens | 2 |
| Typography (Instrument Serif + Inter, self-hosted) | 2 |
| Layout (920px column, hairline rules) | 2, and each section task |
| Hero | 4 |
| Approach (numbered list) | 5 |
| Selected Work + accurate Athena copy | 6 |
| Bio + warm monochrome headshot | 7 |
| Contact (mailto + form) | 8, 9 |
| Footer | 9 |
| Navigation | 3 |
| Removed: tech grid, hero illustration, purple, card treatment | 2, 4, 12 |
| Component structure (8 files, mostly server components) | 3–9 |
| Contact form defects (3 named) | 8 |
| Cleanup 1: missing OG images | 10 |
| Cleanup 2: dead footer links | 9 |
| Cleanup 3: hotlinked screenshots | 6 |
| Cleanup 4: 46 unused shadcn components | 11 |
| Cleanup 5: package name | 11 |
| Cleanup 6: build config | 11 |
| Cleanup 7: orphaned `styles/globals.css` | 2 |
| Cleanup 8: Tailwind theme | 2 |
| Verification criteria | 12 |

No gaps.

**Known deviation from spec:** the spec's component list names `Footer.tsx` as a separate file. This plan folds the footer into `Contact.tsx`, because the spec also specifies the footer sits inside the inverted contact block — two files sharing one background treatment would be a worse boundary than one. Flagged rather than silently changed.

**Placeholder scan:** clean. Every code step contains complete, runnable content. The one `TODO` comment is deliberate, scoped to a named task, and removed by that task.

**Type consistency:** `Status` is defined once in Task 8 and not referenced elsewhere. Component names are consistent between their defining task, `app/page.tsx` in Task 9, and the test imports. Tailwind token names (`paper`, `paper-sunk`, `ink`, `ink-dim`, `ink-faint`, `rule`, `on-ink`, `on-ink-dim`, `on-ink-faint`, `rule-inverse`) are defined in Task 2 and used identically throughout. Section ids (`#top`, `#approach`, `#work`, `#contact`) match between Nav in Task 3 and the sections that define them.
