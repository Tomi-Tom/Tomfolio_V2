import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { validate } from '../middleware/validate.js';
import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';

const router = Router();

// --------------- Zod schemas ---------------

const updateUserSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
});

// --------------- Routes ---------------

// List all users (paginated, searchable, include project count)
router.get(
  '/',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { page, limit, skip } = parsePagination(
      req.query as { page?: string; limit?: string }
    );
    const search = (req.query.search as string) || '';

    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          provider: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { clientProjects: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    res.json(paginatedResponse(users, total, page, limit));
  }
);

// Get user detail with their client projects
router.get(
  '/:id',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        provider: true,
        createdAt: true,
        updatedAt: true,
        clientProjects: {
          include: { _count: { select: { updates: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }
    res.json({ data: user });
  }
);

// Update user role
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateUserSchema),
  async (req: Request, res: Response) => {
    const { role } = req.body;
    if (req.params.id === req.user!.id) {
      throw new AppError(400, 'BAD_REQUEST', 'Cannot change your own role');
    }
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json({ data: user });
  }
);

// Delete user (cascades)
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    await prisma.user.delete({ where: { id: req.params.id as string } });
    res.status(204).send();
  }
);

export default router;
