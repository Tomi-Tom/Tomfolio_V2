import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens.js';
import { AppError } from '../utils/errors.js';

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(
      new AppError(401, 'UNAUTHORIZED', 'Authentication required')
    );
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub as string, role: payload.role as string };
    next();
  } catch {
    return next(
      new AppError(401, 'UNAUTHORIZED', 'Authentication required')
    );
  }
};
