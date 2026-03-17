import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'ADMIN') {
    return next(new AppError(403, 'FORBIDDEN', 'Admin access required'));
  }
  next();
};
