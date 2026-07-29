export default function Hero() {
  return (
    <section className="mx-auto max-w-content px-6 pb-16 pt-32 md:px-14 md:pb-24 md:pt-40">
      <p className="eyebrow mb-8 md:mb-11">Software Consulting</p>

      <h1 className="font-serif text-[15vw] leading-[0.92] tracking-[-0.02em] sm:text-[64px] md:text-[92px]">
        Not so
        <br />
        simple.
      </h1>

      <div className="mt-10 grid items-end gap-8 md:mt-13 md:grid-cols-2 md:gap-14">
        <p className="text-[17px] leading-[1.65] text-ink-dim">
          The simple version of the problem is rarely the one that ships. I do
          architecture and full&#8209;stack engineering for teams building
          systems that have to hold up once the edge cases show up.
        </p>

        <div className="flex items-center gap-7 md:justify-end">
          <a
            href="#contact"
            className="border-b-[1.5px] border-ink pb-0.5 text-sm font-medium"
          >
            Get in touch &rarr;
          </a>
          <a
            href="#work"
            className="border-b border-rule pb-0.5 text-sm text-ink-dim transition-colors hover:text-ink"
          >
            See the work
          </a>
        </div>
      </div>
    </section>
  )
}
