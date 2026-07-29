import Image from "next/image"

export default function Bio() {
  return (
    <section className="mx-auto max-w-content px-6 py-16 md:px-14 md:py-20">
      <p className="eyebrow mb-8 md:mb-11">Who&rsquo;s Behind It</p>

      <div className="grid gap-9 md:grid-cols-[300px_1fr] md:gap-13">
        <Image
          src="/jack-wolfe.jpg"
          alt="Jack Wolfe III"
          width={324}
          height={405}
          className="aspect-[4/5] w-full max-w-[300px] border border-rule object-cover [filter:grayscale(1)_sepia(0.28)_contrast(1.06)_brightness(1.05)]"
        />

        <div>
          <h2 className="mb-5 font-serif text-[38px] tracking-[-0.02em]">
            Jack Wolfe III
          </h2>

          <p className="mb-4 text-base leading-[1.65] text-ink-dim">
            Eleven years building production software: five in aerospace, six in
            finance. Two fields that agree on very little except the important
            part &mdash; the edge cases aren&rsquo;t hypothetical, and
            &ldquo;mostly correct&rdquo; isn&rsquo;t a state you&rsquo;re
            allowed to ship in.
          </p>

          <p className="text-base leading-[1.65] text-ink-dim">
            Not So Simple is where that experience goes to work for other teams.
            The name is the whole thesis: the problems worth hiring someone for
            are the ones without a clean answer, and pretending otherwise is how
            projects get expensive.
          </p>

          <dl className="mt-8 flex border-t border-rule">
            <div className="flex-[5] border-r border-rule pr-5 pt-3.5">
              <dd className="font-serif text-2xl leading-none">05</dd>
              <dt className="eyebrow mt-1.5">Years / Aerospace</dt>
            </div>
            <div className="flex-[6] pl-5 pt-3.5">
              <dd className="font-serif text-2xl leading-none">06</dd>
              <dt className="eyebrow mt-1.5">Years / Finance</dt>
            </div>
          </dl>

          <p className="mt-6 text-[13.5px] text-ink-dim">Streetsboro, Ohio</p>
        </div>
      </div>
    </section>
  )
}
