import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // 1. Admin User
  console.log("👤 Seeding admin user...");
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "contact@tomi-tom.dev" },
    update: {},
    create: {
      email: "contact@tomi-tom.dev",
      firstName: "Tom",
      lastName: "Bariteau-Peter",
      role: "ADMIN",
      password: hashedPassword,
    },
  });
  console.log(`  Created admin: ${admin.email}`);

  // 2. Tags
  console.log("\n🏷️  Seeding tags...");
  const tagNames = [
    "React",
    "TypeScript",
    "Three.js",
    "Tailwind CSS",
    "JavaScript",
    "Canvas",
    "Pixel Art",
    "UI/UX",
    "Accessibility",
    "Framer Motion",
  ];

  const tags: Record<string, { id: string; name: string }> = {};
  for (const name of tagNames) {
    const tag = await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    tags[name] = tag;
    console.log(`  Tag: ${name}`);
  }

  // 3. Skills
  console.log("\n💡 Seeding skills...");
  await prisma.skill.deleteMany();

  const skills = [
    // Frontend (PROFICIENT)
    { name: "React", level: 4, category: "FRONTEND" as const, status: "PROFICIENT" as const, sortOrder: 0 },
    { name: "TypeScript", level: 4, category: "FRONTEND" as const, status: "PROFICIENT" as const, sortOrder: 1 },
    { name: "Tailwind CSS", level: 4, category: "FRONTEND" as const, status: "PROFICIENT" as const, sortOrder: 2 },
    { name: "Three.js", level: 3, category: "FRONTEND" as const, status: "PROFICIENT" as const, sortOrder: 3 },
    { name: "Framer Motion", level: 4, category: "FRONTEND" as const, status: "PROFICIENT" as const, sortOrder: 4 },
    { name: "HTML/CSS", level: 4, category: "FRONTEND" as const, status: "PROFICIENT" as const, sortOrder: 5 },
    // Design (PROFICIENT)
    { name: "UI/UX", level: 4, category: "DESIGN" as const, status: "PROFICIENT" as const, sortOrder: 6 },
    { name: "Figma", level: 4, category: "DESIGN" as const, status: "PROFICIENT" as const, sortOrder: 7 },
    { name: "Design Systems", level: 4, category: "DESIGN" as const, status: "PROFICIENT" as const, sortOrder: 8 },
    { name: "Adobe XD", level: 3, category: "DESIGN" as const, status: "PROFICIENT" as const, sortOrder: 9 },
    { name: "Photoshop", level: 3, category: "DESIGN" as const, status: "PROFICIENT" as const, sortOrder: 10 },
    { name: "Prototyping", level: 4, category: "DESIGN" as const, status: "PROFICIENT" as const, sortOrder: 11 },
    // Backend (PROFICIENT)
    { name: "Node.js", level: 3, category: "BACKEND" as const, status: "PROFICIENT" as const, sortOrder: 12 },
    { name: "Express", level: 3, category: "BACKEND" as const, status: "PROFICIENT" as const, sortOrder: 13 },
    { name: "MongoDB", level: 3, category: "BACKEND" as const, status: "PROFICIENT" as const, sortOrder: 14 },
    { name: "Git", level: 4, category: "BACKEND" as const, status: "PROFICIENT" as const, sortOrder: 15 },
    { name: "REST APIs", level: 4, category: "BACKEND" as const, status: "PROFICIENT" as const, sortOrder: 16 },
    { name: "CI/CD", level: 2, category: "BACKEND" as const, status: "PROFICIENT" as const, sortOrder: 17 },
    // Exploring
    { name: "Next.js", level: 4, category: "FRONTEND" as const, status: "PROFICIENT" as const, sortOrder: 18 },
    { name: "Docker", level: 3, category: "DEVOPS" as const, status: "PROFICIENT" as const, sortOrder: 19 },
    // Exploring
    { name: "Rust", level: 1, category: "OTHER" as const, status: "EXPLORING" as const, sortOrder: 20 },
    { name: "WebGL", level: 1, category: "OTHER" as const, status: "EXPLORING" as const, sortOrder: 21 },
    { name: "AI Integration", level: 1, category: "OTHER" as const, status: "EXPLORING" as const, sortOrder: 22 },
  ];

  await prisma.skill.createMany({ data: skills });
  console.log(`  Created ${skills.length} skills`);

  // 4. Projects
  console.log("\n📁 Seeding projects...");
  // Delete existing projects (this also clears tag relations)
  await prisma.project.deleteMany();

  const project1 = await prisma.project.create({
    data: {
      title: "Personal Portfolio — tombp.fr",
      description:
        "Modern portfolio with horizontal scroll, Three.js wireframe gears, and Void & Gold aesthetic.",
      longDescription:
        "Modern portfolio website showcasing design and development work. Built with React and Framer Motion, featuring smooth animations, interactive elements, and a clean, minimalist aesthetic.",
      imageUrl:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      liveUrl: "https://www.tombp.fr/",
      featured: true,
      sortOrder: 0,
      tags: {
        connect: [
          { id: tags["React"].id },
          { id: tags["TypeScript"].id },
          { id: tags["Three.js"].id },
          { id: tags["Tailwind CSS"].id },
        ],
      },
    },
  });
  console.log(`  Project: ${project1.title}`);

  const project2 = await prisma.project.create({
    data: {
      title: "IsoMaker — 3D Pixel Art Creator",
      description:
        "Interactive isometric pixel art creator with real-time preview, color picker, and export.",
      longDescription:
        "Interactive web application for creating isometric pixel art. Features intuitive controls, real-time preview, color picker, and export functionality.",
      imageUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
      liveUrl: "https://www.isomaker.fr/",
      featured: true,
      sortOrder: 1,
      tags: {
        connect: [
          { id: tags["JavaScript"].id },
          { id: tags["Canvas"].id },
          { id: tags["Pixel Art"].id },
        ],
      },
    },
  });
  console.log(`  Project: ${project2.title}`);

  const project3 = await prisma.project.create({
    data: {
      title: "LibertAI — AI Platform",
      description:
        "Corporate website redesign for an AI company — modern brand presence, responsive, accessible.",
      longDescription:
        "Corporate website redesign for an AI technology company. Focused on creating a modern, trustworthy brand presence with clear communication of complex AI concepts.",
      imageUrl:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
      liveUrl: "https://libertai.io/",
      featured: true,
      sortOrder: 2,
      tags: {
        connect: [
          { id: tags["React"].id },
          { id: tags["UI/UX"].id },
          { id: tags["Accessibility"].id },
        ],
      },
    },
  });
  console.log(`  Project: ${project3.title}`);

  // 5. Services
  console.log("\n🛠️  Seeding services...");
  await prisma.service.deleteMany();

  const services = [
    {
      title: "Développement Web",
      description:
        "Fullstack web development with modern frameworks and best practices. From landing pages to complex web applications.",
      icon: "code",
      sortOrder: 0,
    },
    {
      title: "Design UI/UX",
      description:
        "User interface design and user experience optimization. Creating intuitive, beautiful, and accessible digital experiences.",
      icon: "palette",
      sortOrder: 1,
    },
    {
      title: "Consulting Technique",
      description:
        "Technical consulting and architecture guidance. Helping teams make informed technology decisions.",
      icon: "lightbulb",
      sortOrder: 2,
    },
    {
      title: "Applications Interactives",
      description:
        "Interactive web applications and creative experiences. Games, tools, and immersive digital products.",
      icon: "sparkles",
      sortOrder: 3,
    },
  ];

  await prisma.service.createMany({ data: services });
  console.log(`  Created ${services.length} services`);

  // 6. Testimonials [PLACEHOLDER]
  console.log("\n💬 Seeding testimonials...");
  await prisma.testimonial.deleteMany();

  // [PLACEHOLDER] - Replace with real testimonials when available
  const testimonials = [
    {
      name: "Marie Laurent",
      role: "Product Manager",
      company: "TechVision",
      content:
        "Tom delivered exceptional work on our platform redesign. His attention to detail and understanding of user needs made a real difference.",
      sortOrder: 0,
    },
    {
      name: "Alex Chen",
      role: "CTO",
      company: "StartupFlow",
      content:
        "Working with Tom was a great experience. He brought both technical expertise and creative vision to our project.",
      sortOrder: 1,
    },
    {
      name: "Sophie Martin",
      role: "Design Director",
      company: "PixelCraft",
      content:
        "Tom's ability to bridge design and development is rare. He translated our vision into a polished, performant product.",
      sortOrder: 2,
    },
  ];

  await prisma.testimonial.createMany({ data: testimonials });
  console.log(`  Created ${testimonials.length} testimonials`);

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
