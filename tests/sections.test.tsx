import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import Nav from "@/components/Nav"
import Hero from "@/components/Hero"

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
