import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { verifyAccessToken } from '../utils/tokens.js';
import {
  createMessage,
  listMessages,
  toggleRead,
  deleteMessage,
} from '../services/contact.service.js';

// --------------- Zod schema ---------------

const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  content: z.string().min(10, 'Message must be at least 10 characters'),
});

// --------------- Soft auth middleware ---------------

const softAuth = (req: Request, _res: Response, next: () => void) => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    try {
      const payload = verifyAccessToken(header.slice(7));
      req.user = { id: payload.sub as string, role: payload.role as string };
    } catch {
      // Ignore — proceed without user
    }
  }
  next();
};

// --------------- Router ---------------

const router = Router();

// POST / — public (with optional soft auth)
router.post(
  '/',
  contactLimiter,
  validate(contactSchema),
  softAuth,
  async (req: Request, res: Response) => {
    const message = await createMessage(req.body, req.user?.id);
    res.status(201).json(message);
  }
);

// GET / — admin only
router.get(
  '/',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const filter = req.query.filter as 'all' | 'read' | 'unread' | undefined;
    const result = await listMessages(
      {
        page: req.query.page as string | undefined,
        limit: req.query.limit as string | undefined,
      },
      filter
    );
    res.json(result);
  }
);

// PATCH /:id/read — admin only
router.patch(
  '/:id/read',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const message = await toggleRead(req.params.id as string);
    res.json(message);
  }
);

// DELETE /:id — admin only
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    await deleteMessage(req.params.id as string);
    res.status(204).end();
  }
);

export default router;
