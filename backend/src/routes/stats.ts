import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  getOverview,
  getViewsByPeriod,
  getMessagesByPeriod,
} from '../services/stats.service.js';

const router = Router();

// GET /overview — admin only
router.get(
  '/overview',
  authenticate,
  requireAdmin,
  async (_req: Request, res: Response) => {
    const overview = await getOverview();
    res.json(overview);
  }
);

// GET /views — admin only
router.get(
  '/views',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string, 10) || 30;
    const views = await getViewsByPeriod(days);
    res.json(views);
  }
);

// GET /messages — admin only
router.get(
  '/messages',
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string, 10) || 30;
    const messages = await getMessagesByPeriod(days);
    res.json(messages);
  }
);

export default router;
