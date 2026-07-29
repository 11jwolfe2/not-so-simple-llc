"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

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
            <SheetTitle className="sr-only">Menu</SheetTitle>
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
