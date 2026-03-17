import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Skills } from "@/components/sections/Skills";
import { Services } from "@/components/sections/Services";
import { Projects } from "@/components/sections/Projects";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";
import { SectionDivider } from "@/components/ui/SectionDivider";
import { SectionCanvas } from "@/components/three/SectionCanvasLazy";

const API_URL = process.env.API_URL || "http://localhost:4000";

async function getHomeData() {
  const [skillsRes, projectsRes, servicesRes, testimonialsRes] =
    await Promise.all([
      fetch(`${API_URL}/api/skills`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/api/projects`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/api/services`, { next: { revalidate: 60 } }),
      fetch(`${API_URL}/api/testimonials`, { next: { revalidate: 60 } }),
    ]);

  const [skills, projects, services, testimonials] = await Promise.all([
    skillsRes.json(),
    projectsRes.json(),
    servicesRes.json(),
    testimonialsRes.json(),
  ]);

  return {
    skills: skills.data || [],
    projects: projects.data || [],
    services: services.data || [],
    testimonials: testimonials.data || [],
  };
}

export default async function HomePage() {
  const { skills, projects, services, testimonials } = await getHomeData();

  return (
    <div className="scroll-smooth">
      <section id="intro">
        <Hero />
      </section>

      <SectionDivider />

      <section id="about" className="relative min-h-screen py-24 px-8 md:px-16">
        <SectionCanvas variant="rings" className="absolute inset-0" />
        <About />
      </section>

      <SectionDivider />

      <section id="skills" className="relative min-h-screen py-24 px-8 md:px-16">
        <SectionCanvas variant="grid" className="absolute inset-0" />
        <Skills skills={skills} />
      </section>

      <SectionDivider />

      <section id="services" className="min-h-screen py-24 px-8 md:px-16">
        <Services services={services} />
      </section>

      <SectionDivider />

      <section id="projects" className="relative min-h-screen py-24 px-8 md:px-16">
        <SectionCanvas variant="wave" className="absolute inset-0" />
        <Projects projects={projects} />
      </section>

      <SectionDivider />

      <section id="testimonials" className="relative min-h-screen py-24 px-8 md:px-16">
        <SectionCanvas variant="constellation" className="absolute inset-0" />
        <Testimonials testimonials={testimonials} />
      </section>

      <SectionDivider />

      <section id="contact" className="min-h-screen py-24 px-8 md:px-16">
        <Contact />
      </section>
    </div>
  );
}
