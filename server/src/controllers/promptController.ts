import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

// --- CREATE PROMPT ---
export const createPrompt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;
    const userId = req.user?.userId; // Didapat dari middleware

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const newPrompt = await prisma.masterPrompt.create({
      data: {
        title,
        content,
        userId
      }
    });

    res.status(201).json(newPrompt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create prompt' });
  }
};

// --- GET ALL PROMPTS ---
export const getPrompts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const prompts = await prisma.masterPrompt.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(prompts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prompts' });
  }
};

// --- TOGGLE PIN (Smart Toggle) ---
export const togglePinPrompt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; 
    const userId = req.user?.userId;

    // 1. Cek status prompt yang diklik saat ini
    const targetPrompt = await prisma.masterPrompt.findUnique({
      where: { id }
    });

    if (!targetPrompt) {
      res.status(404).json({ error: 'Prompt not found' });
      return;
    }

    // 2. Reset SEMUA pin user ini ke false dulu (Bersihkan meja)
    await prisma.masterPrompt.updateMany({
      where: { userId },
      data: { isPinned: false }
    });

    // 3. LOGIKA TOGGLE:
    // Jika prompt yang diklik tadi status aslinya "FALSE" (belum aktif), 
    // barulah kita set jadi "TRUE" (aktifkan).
    // 
    // Jika status aslinya "TRUE" (sedang aktif), kita biarkan saja (karena di langkah 2 sudah di-reset jadi false).
    // Ini artinya user ingin mematikan prompt tersebut kembali ke default.
    
    let updatedPrompt = targetPrompt; // Default fallback

    if (!targetPrompt.isPinned) {
      updatedPrompt = await prisma.masterPrompt.update({
        where: { id, userId },
        data: { isPinned: true }
      });
    }

    res.json(updatedPrompt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to pin prompt' });
  }
};