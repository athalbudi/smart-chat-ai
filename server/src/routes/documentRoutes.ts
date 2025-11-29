import { Router } from 'express';
import multer from 'multer';
import { authenticateToken } from '../middlewares/authMiddleware';
import { uploadDocument } from '../controllers/documentController';

const router = Router();
const upload = multer({ dest: 'uploads/' }); // Simpan sementara di folder uploads

// Endpoint: POST /api/documents/upload
router.post('/upload', authenticateToken, upload.single('pdf'), uploadDocument);

export default router;