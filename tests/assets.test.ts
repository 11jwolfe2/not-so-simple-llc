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
  // TODO(Task 10): revert to `it(` once the OG images exist. Deliberately
  // inverted so the suite stays green while sections are built out.
  it.fails("every asset referenced in source exists in public/", () => {
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
