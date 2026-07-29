import Nav from "@/components/Nav"
import Hero from "@/components/Hero"
import Approach from "@/components/Approach"
import SelectedWork from "@/components/SelectedWork"

export default function Home() {
  return (
    <>
      <Nav />
      <main id="top">
        <Hero />
        <Approach />
        <SelectedWork />
      </main>
    </>
  )
}
