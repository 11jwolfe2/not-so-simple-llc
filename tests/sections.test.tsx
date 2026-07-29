import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Nav from "@/components/Nav"
import Hero from "@/components/Hero"
import Approach from "@/components/Approach"
import SelectedWork from "@/components/SelectedWork"
import Bio from "@/components/Bio"
import Contact from "@/components/Contact"

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

describe("SelectedWork", () => {
  it("renders both projects with current descriptions", () => {
    const { container } = render(<SelectedWork />)
    expect(container.querySelector("#work")).toBeInTheDocument()
    expect(screen.getByText("BankFinder.us")).toBeInTheDocument()
    expect(screen.getByText("Project Athena")).toBeInTheDocument()

    // Athena is a Web3 security product — contract scanning, high-risk token
    // filtering, and TGE alerts. An earlier revision wrongly described it as
    // AI tax accounting; guard against that returning.
    expect(screen.getByText(/TGE alerts/i)).toBeInTheDocument()
    expect(
      screen.queryByText(/accounting records|file taxes/i)
    ).not.toBeInTheDocument()
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
    // Athena's domain does not resolve, so its eyebrow carries no "Live"
    // marker — unlike BankFinder, which is reachable.
    expect(screen.getByText("Web3 Security")).toBeInTheDocument()
    expect(screen.queryByText(/Web3 Security \/ Live/)).not.toBeInTheDocument()
    expect(screen.getByText("Fintech / Live")).toBeInTheDocument()
  })

  it("serves every screenshot locally, never from remote blob storage", () => {
    const { container } = render(<SelectedWork />)
    const imgs = Array.from(container.querySelectorAll("img"))
    expect(imgs.length).toBeGreaterThan(0)
    for (const img of imgs) {
      expect(img.getAttribute("src")).toMatch(/^\/work-/)
      expect(img.getAttribute("src")).not.toMatch(/vercel-storage|https?:/)
    }
  })
})

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
