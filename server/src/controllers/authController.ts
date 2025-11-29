import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123'; // Nanti kita pindah ke .env

// --- REGISTER ---
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Cek apakah user sudah ada
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Simpan ke DB
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    });

    res.status(201).json({ 
      message: 'User registered successfully', 
      userId: newUser.id 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// --- LOGIN ---
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Cari user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }

    // 2. Cek password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(400).json({ error: 'Invalid email or password' });
      return;
    }

    // 3. Buat Token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' } // Token berlaku 7 hari
    );

    res.json({ 
      message: 'Login successful', 
      token,
      user: { id: user.id, email: user.email }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};