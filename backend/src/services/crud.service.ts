import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';
import { Prisma } from '@prisma/client';

// --------------- Projects ---------------

export const projectService = {
  async list(filters?: { featured?: boolean; tag?: string }) {
    const where: Prisma.ProjectWhereInput = {};
    if (filters?.featured !== undefined) {
      where.featured = filters.featured;
    }
    if (filters?.tag) {
      where.tags = { some: { name: filters.tag } };
    }
    return prisma.project.findMany({
      where,
      include: { tags: true },
      orderBy: { sortOrder: 'asc' },
    });
  },

  async getById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { tags: true },
    });
    if (!project) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }
    return project;
  },

  async create(data: {
    title: string;
    description: string;
    longDescription?: string;
    imageUrl?: string;
    liveUrl?: string;
    githubUrl?: string;
    tagIds?: string[];
    featured?: boolean;
    sortOrder?: number;
  }) {
    const { tagIds, ...rest } = data;
    return prisma.project.create({
      data: {
        ...rest,
        ...(tagIds && { tags: { connect: tagIds.map((id) => ({ id })) } }),
      },
      include: { tags: true },
    });
  },

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      longDescription?: string;
      imageUrl?: string;
      liveUrl?: string;
      githubUrl?: string;
      tagIds?: string[];
      featured?: boolean;
      sortOrder?: number;
    }
  ) {
    await projectService.getById(id);
    const { tagIds, ...rest } = data;
    return prisma.project.update({
      where: { id },
      data: {
        ...rest,
        ...(tagIds && { tags: { set: tagIds.map((tid) => ({ id: tid })) } }),
      },
      include: { tags: true },
    });
  },

  async remove(id: string) {
    await projectService.getById(id);
    return prisma.project.delete({ where: { id } });
  },
};

// --------------- Skills ---------------

export const skillService = {
  async list(filters?: { category?: string; status?: string }) {
    const where: Prisma.SkillWhereInput = {};
    if (filters?.category) {
      where.category = filters.category as Prisma.EnumSkillCategoryFilter;
    }
    if (filters?.status) {
      where.status = filters.status as Prisma.EnumSkillStatusFilter;
    }
    return prisma.skill.findMany({ where, orderBy: { sortOrder: 'asc' } });
  },

  async getById(id: string) {
    const skill = await prisma.skill.findUnique({ where: { id } });
    if (!skill) {
      throw new AppError(404, 'NOT_FOUND', 'Skill not found');
    }
    return skill;
  },

  async create(data: {
    name: string;
    level: number;
    icon?: string;
    category: string;
    status?: string;
    sortOrder?: number;
  }) {
    return prisma.skill.create({ data: data as any });
  },

  async update(id: string, data: Record<string, unknown>) {
    await skillService.getById(id);
    return prisma.skill.update({ where: { id }, data: data as any });
  },

  async remove(id: string) {
    await skillService.getById(id);
    return prisma.skill.delete({ where: { id } });
  },
};

// --------------- Services ---------------

export const serviceService = {
  async list() {
    return prisma.service.findMany({ orderBy: { sortOrder: 'asc' } });
  },

  async getById(id: string) {
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new AppError(404, 'NOT_FOUND', 'Service not found');
    }
    return service;
  },

  async create(data: {
    title: string;
    description: string;
    icon?: string;
    sortOrder?: number;
  }) {
    return prisma.service.create({ data });
  },

  async update(id: string, data: Record<string, unknown>) {
    await serviceService.getById(id);
    return prisma.service.update({ where: { id }, data: data as any });
  },

  async remove(id: string) {
    await serviceService.getById(id);
    return prisma.service.delete({ where: { id } });
  },
};

// --------------- Testimonials ---------------

export const testimonialService = {
  async list() {
    return prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } });
  },

  async getById(id: string) {
    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) {
      throw new AppError(404, 'NOT_FOUND', 'Testimonial not found');
    }
    return testimonial;
  },

  async create(data: {
    name: string;
    role: string;
    company?: string;
    content: string;
    avatarUrl?: string;
    sortOrder?: number;
  }) {
    return prisma.testimonial.create({ data });
  },

  async update(id: string, data: Record<string, unknown>) {
    await testimonialService.getById(id);
    return prisma.testimonial.update({ where: { id }, data: data as any });
  },

  async remove(id: string) {
    await testimonialService.getById(id);
    return prisma.testimonial.delete({ where: { id } });
  },
};

// --------------- Tags ---------------

export const tagService = {
  async list() {
    return prisma.tag.findMany({ orderBy: { name: 'asc' } });
  },

  async create(data: { name: string }) {
    return prisma.tag.create({ data });
  },

  async remove(id: string) {
    const tag = await prisma.tag.findUnique({ where: { id } });
    if (!tag) {
      throw new AppError(404, 'NOT_FOUND', 'Tag not found');
    }
    return prisma.tag.delete({ where: { id } });
  },
};
