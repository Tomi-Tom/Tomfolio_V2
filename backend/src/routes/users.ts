import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import prisma from '../lib/prisma.js';
import { AppError } from '../utils/errors.js';

// --------------- Zod schemas ---------------

const updateProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
});

const userDataSchema = z.object({
  value: z.any(),
});

// --------------- Router ---------------

const router = Router();

// PATCH /me — update own profile
router.patch(
  '/me',
  authenticate,
  validate(updateProfileSchema),
  async (req: Request, res: Response) => {
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: req.body,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(user);
  }
);

// DELETE /me — delete own account
router.delete(
  '/me',
  authenticate,
  async (req: Request, res: Response) => {
    await prisma.user.delete({ where: { id: req.user!.id } });
    res.status(204).end();
  }
);

// GET /me/data — list all UserData for current user
router.get(
  '/me/data',
  authenticate,
  async (req: Request, res: Response) => {
    const data = await prisma.userData.findMany({
      where: { userId: req.user!.id },
    });
    res.json(data);
  }
);

// PUT /me/data/:key — upsert UserData
router.put(
  '/me/data/:key',
  authenticate,
  validate(userDataSchema),
  async (req: Request, res: Response) => {
    const { key } = req.params;
    const { value } = req.body;
    const entry = await prisma.userData.upsert({
      where: { userId_key: { userId: req.user!.id, key } },
      update: { value },
      create: { userId: req.user!.id, key, value },
    });
    res.json(entry);
  }
);

// DELETE /me/data/:key — delete UserData entry
router.delete(
  '/me/data/:key',
  authenticate,
  async (req: Request, res: Response) => {
    const { key } = req.params;
    const existing = await prisma.userData.findUnique({
      where: { userId_key: { userId: req.user!.id, key } },
    });
    if (!existing) {
      throw new AppError(404, 'NOT_FOUND', 'User data entry not found');
    }
    await prisma.userData.delete({
      where: { userId_key: { userId: req.user!.id, key } },
    });
    res.status(204).end();
  }
);

export default router;
