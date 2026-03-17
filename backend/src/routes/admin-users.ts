import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';
import { parsePagination, paginatedResponse } from '../utils/pagination.js';

const router = Router();

// --------------- Routes ---------------

// List all users (paginated, include project count)
router.get(
  '/',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { page, limit, skip } = parsePagination(
      req.query as { page?: string; limit?: string }
    );
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { clientProjects: true } },
        },
      }),
      prisma.user.count(),
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
        role: true,
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
