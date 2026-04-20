import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Services } from "@/components/sections/Services";
import { Projects } from "@/components/sections/Projects";
import { Contact } from "@/components/sections/Contact";
import { Playground } from "@/components/sections/Playground";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { SectionCanvas } from "@/components/three/SectionCanvasLazy";

export default function HomePage() {
  return (
    <div className="scroll-smooth">
      <section id="intro">
        <Hero />
      </section>

      <SectionDivider />

      <section id="about" className="relative min-h-screen py-24 px-4 sm:px-8 md:px-16">
        <SectionCanvas variant="rings" className="absolute inset-0" />
        <About />
      </section>

      <SectionDivider />

      <section id="skills" className="relative min-h-screen py-24 px-4 sm:px-8 md:px-16">
        <SectionCanvas variant="grid" className="absolute inset-0" />
        <Skills />
      </section>

      <SectionDivider />

      <section id="services" className="min-h-screen py-24 px-4 sm:px-8 md:px-16">
        <Services />
      </section>

      <SectionDivider />

      <section id="projects" className="relative min-h-screen py-24 px-4 sm:px-8 md:px-16">
        <SectionCanvas variant="wave" className="absolute inset-0" />
        <Projects />
      </section>

      <SectionDivider />

      <section id="playground" className="relative min-h-screen py-24 px-4 sm:px-8 md:px-16">
        <SectionCanvas variant="constellation" className="absolute inset-0" />
        <Playground />
      </section>

      <SectionDivider />

      <section id="contact" className="min-h-screen py-24 px-4 sm:px-8 md:px-16">
        <Contact />
      </section>
    </div>
  );
}
