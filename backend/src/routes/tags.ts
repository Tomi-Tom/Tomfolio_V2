import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { tagService } from '../services/crud.service.js';

const router = Router();

// --------------- Zod schemas ---------------

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

// --------------- Routes ---------------

// Public
router.get('/', async (_req: Request, res: Response) => {
  const data = await tagService.list();
  res.json({ data });
});

// Admin
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createSchema),
  async (req: Request, res: Response) => {
    const data = await tagService.create(req.body);
    res.status(201).json({ data });
  }
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    await tagService.remove(req.params.id as string);
    res.status(204).send();
  }
);

export default router;
