import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

const router = Router();

// --------------- Zod schemas ---------------

const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  clientId: z.string().uuid('clientId must be a valid UUID'),
  price: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const updateProjectSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z
    .enum([
      'QUOTE_PENDING',
      'QUOTE_ACCEPTED',
      'QUOTE_REJECTED',
      'IN_PROGRESS',
      'REVIEW',
      'COMPLETED',
      'CANCELLED',
    ])
    .optional(),
  price: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const createUpdateSchema = z.object({
  content: z.string().min(1, 'Content is required'),
  imageUrls: z.array(z.string()).optional().default([]),
  links: z.array(z.string()).optional().default([]),
});

const clientSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
} as const;

// --------------- User routes (own projects) — registered before /:id ---------------

// List own client projects
router.get(
  '/me',
  authenticate,
  async (req: Request, res: Response) => {
    const projects = await prisma.clientProject.findMany({
      where: { clientId: req.user!.id },
      include: { _count: { select: { updates: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: projects });
  }
);

// Get own project detail
router.get(
  '/me/:id',
  authenticate,
  async (req: Request, res: Response) => {
    const project = await prisma.clientProject.findUnique({
      where: { id: req.params.id as string },
      include: { updates: { orderBy: { createdAt: 'desc' } } },
    });
    if (!project || project.clientId !== req.user!.id) {
      throw new AppError(404, 'NOT_FOUND', 'Client project not found');
    }
    res.json({ data: project });
  }
);

// --------------- Admin routes ---------------

// List all client projects
router.get(
  '/',
  authenticate,
  requireAdmin,
  async (_req: Request, res: Response) => {
    const projects = await prisma.clientProject.findMany({
      include: {
        client: { select: clientSelect },
        _count: { select: { updates: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: projects });
  }
);

// Get project detail (admin)
router.get(
  '/:id',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const project = await prisma.clientProject.findUnique({
      where: { id: req.params.id as string },
      include: {
        client: { select: clientSelect },
        updates: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!project) {
      throw new AppError(404, 'NOT_FOUND', 'Client project not found');
    }
    res.json({ data: project });
  }
);

// Create project
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createProjectSchema),
  async (req: Request, res: Response) => {
    const { title, description, clientId, price, startDate, endDate } =
      req.body;
    const project = await prisma.clientProject.create({
      data: {
        title,
        description,
        clientId,
        price,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        client: { select: clientSelect },
      },
    });
    res.status(201).json({ data: project });
  }
);

// Update project
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateProjectSchema),
  async (req: Request, res: Response) => {
    const { title, description, status, price, startDate, endDate } = req.body;
    const project = await prisma.clientProject.update({
      where: { id: req.params.id as string },
      data: {
        title,
        description,
        status,
        price,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });
    res.json({ data: project });
  }
);

// Delete project (cascades to updates)
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    await prisma.clientProject.delete({
      where: { id: req.params.id as string },
    });
    res.status(204).send();
  }
);

// Add an update to a project
router.post(
  '/:id/updates',
  authenticate,
  requireAdmin,
  validate(createUpdateSchema),
  async (req: Request, res: Response) => {
    const { content, imageUrls, links } = req.body;
    const projectId = req.params.id as string;
    // Verify project exists
    const project = await prisma.clientProject.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new AppError(404, 'NOT_FOUND', 'Client project not found');
    }
    const update = await prisma.projectUpdate.create({
      data: {
        clientProjectId: projectId,
        content,
        imageUrls,
        links,
      },
    });
    res.status(201).json({ data: update });
  }
);

// Delete an update
router.delete(
  '/:id/updates/:updateId',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    await prisma.projectUpdate.delete({
      where: { id: req.params.updateId as string },
    });
    res.status(204).send();
  }
);

export default router;
