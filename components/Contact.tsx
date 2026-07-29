import ContactForm from "@/components/ContactForm"

export default function Contact() {
  const year = new Date().getFullYear()

  return (
    <section id="contact" className="bg-ink text-on-ink">
      <div className="mx-auto max-w-content px-6 py-16 md:px-14 md:py-20">
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

        <div className="mt-14 grid gap-9 border-t border-rule-inverse pt-11 md:grid-cols-[0.85fr_1.15fr] md:gap-13">
          <p className="text-sm leading-[1.65] text-on-ink-dim">
            Prefer to write it out? The form goes to the same inbox.
          </p>
          <ContactForm />
        </div>

        <footer className="mt-16 flex flex-col gap-2 border-t border-rule-inverse pt-7 text-[12.5px] text-on-ink-dim sm:flex-row sm:justify-between">
          <span>&copy; {year} Not So Simple, LLC</span>
          <span>Streetsboro, Ohio</span>
        </footer>
      </div>
    </section>
  )
}
