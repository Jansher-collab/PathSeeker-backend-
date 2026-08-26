import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'Admin') {
    res.status(403).json({
      success: false,
      message: 'Access forbidden: Admin privileges required for this operation.',
    });
    return;
  }
  next();
};
