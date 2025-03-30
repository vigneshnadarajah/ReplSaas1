
import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name: string;
    roles: string[];
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // For development/demo purposes, we'll create a default user
  const userId = req.headers['x-replit-user-id'] || 'demo-user-id';
  const userName = req.headers['x-replit-user-name'] || 'demo-user';
  const userRoles = req.headers['x-replit-user-roles'] as string || '[]';

  // Get or create user in our database
  let user = await storage.getUserByReplitId(userId as string);
  if (!user) {
    user = await storage.createUser({
      replitId: userId as string,
      username: userName as string,
      roles: userRoles ? JSON.parse(userRoles) : []
    });
  }

  req.user = {
    id: userId as string,
    name: userName as string,
    roles: userRoles ? JSON.parse(userRoles) : []
  };

  next();
};
