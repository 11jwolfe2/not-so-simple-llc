import ContactForm from "@/components/ContactForm"

export default function Contact() {
  const year = new Date().getFullYear()

  return (
    <>
      <section id="contact" className="bg-ink text-on-ink">
        <div className="mx-auto max-w-content px-6 pb-16 pt-16 md:px-14 md:pt-20">
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

          <div className="mt-14 grid gap-9 border-t border-rule-inverse pt-11 md:grid-cols-[0.85fr_1.15fr]">
            <p className="text-sm leading-[1.65] text-on-ink-dim">
              Prefer to write it out? The form goes to the same inbox.
            </p>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Rendered as a sibling of the section (not nested inside it) so it
          maps to the page's contentinfo landmark instead of being scoped to
          the section. Kept bg-ink so it reads as a continuation of the same
          dark block — no visible seam. */}
      <footer className="bg-ink text-on-ink">
        <div className="mx-auto flex max-w-content flex-col gap-2 border-t border-rule-inverse px-6 pb-16 pt-7 text-[12.5px] text-on-ink-dim sm:flex-row sm:justify-between md:px-14 md:pb-20">
          <span>&copy; {year} Not So Simple, LLC</span>
          <span>Streetsboro, Ohio</span>
        </div>
      </footer>
    </>
  )
}
