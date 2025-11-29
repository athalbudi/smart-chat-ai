import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { processDocument } from '../services/ragService';

export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Proses PDF (Berat, jadi kita await)
    const result = await processDocument(req.file.path, req.file.originalname, userId);

    res.status(201).json({ 
      message: 'Document processed successfully', 
      stats: result 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process document' });
  }
};