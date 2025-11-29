import { Router } from 'express';
import { createPrompt, getPrompts, togglePinPrompt } from '../controllers/promptController'; // Tambah import
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/', authenticateToken, createPrompt);
router.get('/', authenticateToken, getPrompts);
router.patch('/:id/pin', authenticateToken, togglePinPrompt); // <--- Endpoint Baru

export default router;