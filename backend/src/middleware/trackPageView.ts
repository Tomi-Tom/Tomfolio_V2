import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { anonymizeIp } from '../utils/ip.js';

export const trackPageView = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const path = req.path;
  const referrer = req.get('referer') || null;
  const userAgent = req.get('user-agent') || null;
  const ip = req.ip ? anonymizeIp(req.ip) : null;

  // Fire-and-forget
  prisma.pageView
    .create({
      data: { path, referrer, userAgent, ip },
    })
    .catch(() => {});

  next();
};
