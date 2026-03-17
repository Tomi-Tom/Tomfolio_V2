import { Hero } from "@/components/sections/Hero";

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

      <section
        id="about"
        className="min-h-screen flex items-center justify-center px-8 md:px-16"
      >
        <p className="text-text-secondary text-center text-h3 font-display">
          About section coming next...
        </p>
      </section>

      <section
        id="skills"
        className="min-h-screen flex items-center justify-center px-8 md:px-16"
      >
        <p className="text-text-secondary text-center">
          Skills: {skills.length} loaded
        </p>
      </section>

      <section
        id="services"
        className="min-h-screen flex items-center justify-center px-8 md:px-16"
      >
        <p className="text-text-secondary text-center">
          Services: {services.length} loaded
        </p>
      </section>

      <section
        id="projects"
        className="min-h-screen flex items-center justify-center px-8 md:px-16"
      >
        <p className="text-text-secondary text-center">
          Projects: {projects.length} loaded
        </p>
      </section>

      <section
        id="testimonials"
        className="min-h-screen flex items-center justify-center px-8 md:px-16"
      >
        <p className="text-text-secondary text-center">
          Testimonials: {testimonials.length} loaded
        </p>
      </section>

      <section
        id="contact"
        className="min-h-screen flex items-center justify-center px-8 md:px-16"
      >
        <p className="text-text-secondary text-center">
          Contact section coming next...
        </p>
      </section>
    </div>
  );
}
