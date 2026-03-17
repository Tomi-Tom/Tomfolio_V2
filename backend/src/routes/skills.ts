import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { skillService } from '../services/crud.service.js';

const router = Router();

// --------------- Zod schemas ---------------

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  level: z.number().int().min(1).max(4),
  icon: z.string().optional(),
  category: z.enum(['FRONTEND', 'BACKEND', 'DEVOPS', 'DESIGN', 'OTHER']),
  status: z.enum(['PROFICIENT', 'EXPLORING']).optional().default('PROFICIENT'),
  sortOrder: z.number().optional(),
});

const updateSchema = createSchema.partial();

// --------------- Routes ---------------

// Public
router.get('/', async (req: Request, res: Response) => {
  const category = req.query.category as string | undefined;
  const status = req.query.status as string | undefined;
  const data = await skillService.list({ category, status });
  res.json({ data });
});

router.get('/:id', async (req: Request, res: Response) => {
  const data = await skillService.getById(req.params.id as string);
  res.json({ data });
});

// Admin
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createSchema),
  async (req: Request, res: Response) => {
    const data = await skillService.create(req.body);
    res.status(201).json({ data });
  }
);

router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateSchema),
  async (req: Request, res: Response) => {
    const data = await skillService.update(req.params.id as string, req.body);
    res.json({ data });
  }
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    await skillService.remove(req.params.id as string);
    res.status(204).send();
  }
);

export default router;
