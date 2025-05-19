'use client'

import Image from "next/image"
import { Button } from "@/components/ui/button"
import ContactForm from "@/components/ContactForm"

export default function Home() {
  const projects = [
    {
      title: "BankFinder.us",
      description:
        "A comprehensive financial institution comparison platform helping users discover and compare modern banking solutions.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-kZRT8d1A7ndyiQv8fN8invE82n42D9.png",
      link: "https://bankfinder.us",
    },
    {
      title: "Project Athena",
      description:
        "A Web3 security platform providing real-time TGE alerts and protection against malicious actors in the blockchain space.",
      image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-XUTTLmGh5QvwjlEM46gvH5SZJFKbt5.png",
      link: "https://www.athena.foo",
    },
  ]

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center pt-20 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                NOT SO <span className="text-[#7F62F4]">SIMPLE</span>, LLC
                <br />
                SOFTWARE
                <br />
                CONSULTING<span className="text-[#7F62F4]">.</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-lg">
                Transforming complex challenges into elegant solutions. Bringing your software vision to life with
                precision and expertise.
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="bg-[#7F62F4] hover:bg-[#6B4FE6] transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    document.querySelector("#work")?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  View Projects
                </Button>
              </div>
            </div>
            <div className="relative aspect-square">
              <Image
                src="/hero-image.png"
                alt="Futuristic laptop interface representing modern software solutions"
                width={600}
                height={600}
                className="rounded-2xl object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-12">
            Services<span className="text-[#7F62F4]">.</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Software Architecture",
                description: "Designing scalable and maintainable systems that grow with your business.",
              },
              {
                title: "Full-Stack Development",
                description: "End-to-end development using modern technologies and best practices.",
              },
              {
                title: "Technical Consulting",
                description: "Strategic guidance to help you make informed technology decisions.",
              },
            ].map((service, index) => (
              <div key={index} className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors">
                <h3 className="text-xl font-semibold mb-4">{service.title}</h3>
                <p className="text-gray-400">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="work" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-12">
            Recent Work<span className="text-[#7F62F4]">.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <div key={project.title} className="group relative aspect-video rounded-2xl overflow-hidden bg-black/20">
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  width={600}
                  height={400}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-semibold mb-2 text-white">{project.title}</h3>
                    <p className="text-gray-200 mb-4">{project.description}</p>
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-white hover:text-[#7F62F4] transition-colors"
                    >
                      Visit Site
                      <svg
                        className="w-5 h-5 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 bg-black/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-12">
            Technologies<span className="text-[#7F62F4]">.</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker", "GraphQL"].map((tech) => (
              <div key={tech} className="p-6 rounded-2xl bg-white/5 text-center">
                <span className="text-lg font-medium">{tech}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Let's Work Together<span className="text-[#7F62F4]">.</span>
            </h2>
            <p className="text-gray-400">Have a project in mind? Let's discuss how we can bring your vision to life.</p>
          </div>
          <ContactForm />
        </div>
      </section>
    </main>
  )
}

