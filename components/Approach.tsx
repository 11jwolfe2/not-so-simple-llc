const rows = [
  {
    n: "01",
    title: "Software architecture",
    body: "Systems designed to survive their second year. Data models, service boundaries, and the handful of decisions that get expensive to reverse later.",
  },
  {
    n: "02",
    title: "Full‑stack development",
    body: "Shipped product, not prototypes. Front to back, including the deploys, migrations, and monitoring that decide whether it actually works in the world.",
  },
  {
    n: "03",
    title: "Technical consulting",
    body: "A straight second opinion. Build‑versus‑buy, stack choices, and an honest read on what's actually slowing the team down.",
  },
]

export default function Approach() {
  return (
    <section
      id="approach"
      className="mx-auto max-w-content border-t border-rule px-6 py-16 md:px-14 md:py-20"
    >
      <p className="eyebrow mb-3">Approach</p>
      <h2 className="mb-10 max-w-[11em] font-serif text-[34px] leading-[1.05] tracking-[-0.02em] md:mb-14 md:text-[44px]">
        Three ways I&rsquo;m usually useful.
      </h2>

      <ol>
        {rows.map((row, i) => (
          <li
            key={row.n}
            className={`grid gap-4 border-t border-rule py-7 md:grid-cols-[64px_1.1fr_1.4fr] md:gap-8 ${
              i === rows.length - 1 ? "border-b" : ""
            }`}
          >
            <span aria-hidden="true" className="font-serif text-xl text-ink-faint">
              {row.n}
            </span>
            <h3 className="text-xl font-medium tracking-[-0.015em]">
              {row.title}
            </h3>
            <p className="text-[15px] leading-[1.65] text-ink-dim">
              {row.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
