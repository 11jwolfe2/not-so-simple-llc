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
