import { Router } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();

// Definisi endpoint: POST /api/auth/register
router.post('/register', register);

// Definisi endpoint: POST /api/auth/login
router.post('/login', login);

export default router;