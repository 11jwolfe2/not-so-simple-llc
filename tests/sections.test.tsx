import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Nav from "@/components/Nav"
import Hero from "@/components/Hero"
import Approach from "@/components/Approach"
import SelectedWork from "@/components/SelectedWork"

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
