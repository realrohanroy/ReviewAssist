import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { prisma } from '../db.js';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  let token: string | undefined;

  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies.auth_token) {
    token = req.cookies.auth_token;
  }
  // 2. Check Authorization: Bearer header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ error: 'Authentication required. No session token provided.' });
    return;
  }

  const payload: TokenPayload | null = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
    return;
  }

  // 3. Verify user account is still active in database
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Account is deactivated or does not exist.' });
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as 'admin' | 'employee'
    };

    next();
  } catch (err) {
    // If database is temporarily unavailable, fall back to valid token payload
    req.user = {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role
    };
    next();
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    return;
  }

  next();
}
