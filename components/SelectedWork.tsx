import Image from "next/image"

const projects = [
  {
    eyebrow: "Fintech / Live",
    title: "BankFinder.us",
    body: "Most people never switch banks because comparing them is miserable. BankFinder puts modern banking alternatives side by side, so finding a better account takes minutes instead of an afternoon.",
    href: "https://bankfinder.us",
    label: "bankfinder.us",
    image: "/work-bankfinder.png",
  },
  {
    eyebrow: "Web3 Security",
    title: "Project Athena",
    body: "Token launches are where crypto's worst actors do their best work. Athena scans contracts as they appear, filters out high‑risk ERC‑20s before money moves, and puts real‑time TGE alerts in front of people early enough to act on.",
    href: null,
    label: null,
    image: "/work-athena.png",
  },
]

export default function SelectedWork() {
  return (
    <section id="work" className="bg-paper-sunk">
      <div className="mx-auto max-w-content px-6 py-16 md:px-14 md:py-20">
        <p className="eyebrow mb-3">Selected Work</p>
        <h2 className="mb-12 font-serif text-[34px] leading-[1.05] tracking-[-0.02em] md:mb-14 md:text-[44px]">
          Two things worth showing.
        </h2>

        <div className="flex flex-col gap-14 md:gap-16">
          {projects.map((project, i) => (
            <article
              key={project.title}
              className="grid items-center gap-8 md:grid-cols-2 md:gap-11"
            >
              <div className={i % 2 === 1 ? "md:order-2" : undefined}>
                <p className="eyebrow mb-3.5">{project.eyebrow}</p>
                <h3 className="mb-3.5 font-serif text-[34px] tracking-[-0.02em]">
                  {project.title}
                </h3>
                <p className="max-w-[46em] text-[15px] leading-[1.65] text-ink-dim">
                  {project.body}
                </p>
                {project.href && (
                  <a
                    href={project.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-block border-b-[1.5px] border-ink pb-0.5 text-[13.5px] font-medium"
                  >
                    {project.label} ↗
                  </a>
                )}
              </div>

              <Image
                src={project.image}
                alt={`${project.title} homepage`}
                width={1200}
                height={675}
                className={`aspect-[16/9] w-full border border-rule object-cover ${
                  i % 2 === 1 ? "md:order-1" : ""
                }`}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
