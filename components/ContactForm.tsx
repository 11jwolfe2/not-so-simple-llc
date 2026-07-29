"use client"

import { useState } from "react"

type Status = "idle" | "submitting" | "success" | "error"
type FieldName = "name" | "email" | "message"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const field =
  "w-full border-0 border-b border-rule-inverse bg-transparent pb-2.5 text-[13px] text-on-ink placeholder:text-on-ink-dim focus:border-on-ink focus:outline-none focus:ring-0"

const FEEDBACK_ID = "contact-form-feedback"

export default function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" })
  const [status, setStatus] = useState<Status>("idle")
  const [feedback, setFeedback] = useState("")
  const [invalidField, setInvalidField] = useState<FieldName | null>(null)
  const [botcheck, setBotcheck] = useState(false)

  const set = (key: keyof typeof values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setValues({ ...values, [key]: e.target.value })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!values.name.trim()) {
      setStatus("error")
      setInvalidField("name")
      setFeedback("Please add your name.")
      return
    }

    if (!EMAIL_RE.test(values.email)) {
      setStatus("error")
      setInvalidField("email")
      setFeedback("That doesn't look like a valid email address.")
      return
    }

    if (!values.message.trim()) {
      setStatus("error")
      setInvalidField("message")
      setFeedback("Let me know what you're working on.")
      return
    }

    setInvalidField(null)

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
          botcheck,
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
      {/* Web3Forms honeypot: hidden from sighted users and assistive tech.
          Bots that auto-fill every field will populate this; humans never
          see or reach it, so it must not affect legitimate submissions. */}
      <input
        type="checkbox"
        name="botcheck"
        checked={botcheck}
        onChange={(e) => setBotcheck(e.target.checked)}
        className="hidden"
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

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
            aria-invalid={invalidField === "name"}
            aria-describedby={invalidField === "name" ? FEEDBACK_ID : undefined}
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
            aria-invalid={invalidField === "email"}
            aria-describedby={invalidField === "email" ? FEEDBACK_ID : undefined}
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
          aria-invalid={invalidField === "message"}
          aria-describedby={invalidField === "message" ? FEEDBACK_ID : undefined}
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

      <p
        id={FEEDBACK_ID}
        role={status === "error" ? "alert" : "status"}
        className={`text-[13px] ${
          status === "error" ? "text-on-ink" : "text-on-ink-dim"
        }`}
      >
        {feedback}
      </p>
    </form>
  )
}
