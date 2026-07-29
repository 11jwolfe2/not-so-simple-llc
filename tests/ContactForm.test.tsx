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

  it("rejects an empty name without calling the API", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/email/i), "ada@example.com")
    await user.type(screen.getByLabelText(/working on/i), "Hello.")
    await user.click(screen.getByRole("button", { name: /send/i }))

    expect(await screen.findByText(/add your name/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("rejects a whitespace-only message without calling the API", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/name/i), "Ada Lovelace")
    await user.type(screen.getByLabelText(/email/i), "ada@example.com")
    await user.type(screen.getByLabelText(/working on/i), "   ")
    await user.click(screen.getByRole("button", { name: /send/i }))

    expect(await screen.findByText(/what you're working on/i)).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
