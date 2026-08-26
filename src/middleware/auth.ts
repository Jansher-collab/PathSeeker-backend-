import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { mockUsers } from '../seed/seedData';

export interface AuthRequest extends Request {
  user?: IUser | any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized to access this route. Token missing.' });
    return;
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'pathseeker_super_secret_jwt_key_2026_career_passport');

    // Try MongoDB query first
    try {
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        next();
        return;
      }
    } catch (e) {
      // If DB is offline, check mock store
    }

    // Fallback to in-memory mock store by ID or email
    const mockUser = mockUsers.find((u) => u._id === decoded.id || u.email === decoded.email);
    if (mockUser) {
      req.user = mockUser;
      next();
      return;
    }

    res.status(401).json({ success: false, message: 'User belonging to this token no longer exists.' });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
};
