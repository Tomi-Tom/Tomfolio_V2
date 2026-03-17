import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { testimonialService } from '../services/crud.service.js';

const router = Router();

// --------------- Zod schemas ---------------

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  company: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  avatarUrl: z.string().optional(),
  sortOrder: z.number().optional(),
});

const updateSchema = createSchema.partial();

// --------------- Routes ---------------

// Public
router.get('/', async (_req: Request, res: Response) => {
  const data = await testimonialService.list();
  res.json({ data });
});

router.get('/:id', async (req: Request, res: Response) => {
  const data = await testimonialService.getById(req.params.id as string);
  res.json({ data });
});

// Admin
router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createSchema),
  async (req: Request, res: Response) => {
    const data = await testimonialService.create(req.body);
    res.status(201).json({ data });
  }
);

router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateSchema),
  async (req: Request, res: Response) => {
    const data = await testimonialService.update(req.params.id as string, req.body);
    res.json({ data });
  }
);

router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    await testimonialService.remove(req.params.id as string);
    res.status(204).send();
  }
);

export default router;
