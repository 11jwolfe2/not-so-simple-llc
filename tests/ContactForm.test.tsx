import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ContactForm from "@/components/ContactForm"

const fill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/name/i), "Ada Lovelace")
  await user.type(screen.getByLabelText(/email/i), "ada@example.com")
  await user.type(screen.getByLabelText(/working on/i), "A difference engine.")
}

const okResponse = () =>
  vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) })

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

  it("shows a confirmation and clears all three fields on success", async () => {
    vi.stubGlobal("fetch", okResponse())
    const user = userEvent.setup()
    render(<ContactForm />)
    await fill(user)
    await user.click(screen.getByRole("button", { name: /send/i }))

    expect(await screen.findByText(/Thanks/i)).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue("")
      expect(screen.getByLabelText(/email/i)).toHaveValue("")
      expect(screen.getByLabelText(/working on/i)).toHaveValue("")
    })
  })

  it("surfaces a readable error when the HTTP response is not ok", async () => {
    // ok: false alone should be enough to trigger the error branch, with
    // no "success" field in play at all — isolates that signal from
    // json().success.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({}) })
    )
    const user = userEvent.setup()
    render(<ContactForm />)
    await fill(user)
    await user.click(screen.getByRole("button", { name: /send/i }))

    expect(await screen.findByText(/didn't go through/i)).toBeInTheDocument()
  })

  it("surfaces a readable error when web3forms reports success: false", async () => {
    // ok: true but success: false should also trigger the error branch,
    // isolating that signal from response.ok.
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: false }) })
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

  it("submits the exact payload web3forms expects, to the right endpoint", async () => {
    const fetchMock = okResponse()
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<ContactForm />)
    await fill(user)
    await user.click(screen.getByRole("button", { name: /send/i }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const [url, options] = fetchMock.mock.calls[0]

    expect(url).toBe("https://api.web3forms.com/submit")
    expect(options.method).toBe("POST")

    const body = JSON.parse(options.body)
    expect(body.access_key).toBe("test-key")
    expect(body.name).toBe("Ada Lovelace")
    expect(body.email).toBe("ada@example.com")
    expect(body.message).toBe("A difference engine.")
  })

  it("shows a submitting state and disables the submit button while the request is in flight", async () => {
    let resolveFetch: (value: unknown) => void = () => {}
    const pending = new Promise((resolve) => {
      resolveFetch = resolve
    })
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending))
    const user = userEvent.setup()
    render(<ContactForm />)
    await fill(user)

    await user.click(screen.getByRole("button", { name: /send/i }))

    const submitting = await screen.findByRole("button", { name: /sending/i })
    expect(submitting).toBeDisabled()

    resolveFetch!({ ok: true, json: async () => ({ success: true }) })

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /send/i })).not.toBeDisabled()
    )
  })

  it("includes the botcheck honeypot in the payload without blocking a legitimate submission", async () => {
    const fetchMock = okResponse()
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<ContactForm />)
    await fill(user)
    // A real visitor never sees or touches the honeypot field — submit as-is.
    await user.click(screen.getByRole("button", { name: /send/i }))

    expect(await screen.findByText(/Thanks/i)).toBeInTheDocument()
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.botcheck).toBe(false)
  })

  it("hides the honeypot field from sighted users and assistive tech", () => {
    render(<ContactForm />)
    const honeypot = document.querySelector('input[name="botcheck"]')

    expect(honeypot).not.toBeNull()
    expect(honeypot).toHaveAttribute("aria-hidden", "true")
    expect(honeypot).toHaveAttribute("tabIndex", "-1")
    expect(honeypot).not.toBeVisible()
  })

  it("marks the invalid field with aria-invalid and points aria-describedby at the feedback message", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/email/i), "ada@example.com")
    await user.type(screen.getByLabelText(/working on/i), "Hello.")
    await user.click(screen.getByRole("button", { name: /send/i }))

    const feedback = await screen.findByText(/add your name/i)
    const nameField = screen.getByLabelText(/name/i)

    expect(nameField).toHaveAttribute("aria-invalid", "true")
    expect(nameField).toHaveAttribute("aria-describedby", feedback.id)
    expect(screen.getByLabelText(/email/i)).toHaveAttribute("aria-invalid", "false")
  })

  it("keeps the feedback live region mounted at all times so it's announced when it fills in", () => {
    render(<ContactForm />)
    // Before any interaction, the live region must already exist in the
    // document (not conditionally mounted later) so assistive tech has
    // already registered it and will announce the text once it appears.
    const feedback = document.getElementById("contact-form-feedback")

    expect(feedback).not.toBeNull()
    expect(feedback).toHaveAttribute("role", "status")
    expect(feedback?.textContent).toBe("")
  })
})
