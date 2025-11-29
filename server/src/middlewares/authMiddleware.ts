import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// Kita perlu memperluas tipe Request agar bisa menampung data 'user'
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // 1. Ambil header Authorization (Biasanya format: "Bearer <token>")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Ambil tokennya saja

  if (!token) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return;
  }

  try {
    // 2. Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    // 3. Tempelkan data user ke request object agar bisa dipakai di controller
    req.user = decoded;
    
    next(); // Lanjut ke controller berikutnya
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token.' });
  }
};