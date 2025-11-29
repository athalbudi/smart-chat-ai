import { Router } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import { 
  getConversations, 
  createConversation, 
  getMessages, 
  sendMessage 
} from '../controllers/chatController';

const router = Router();

// Semua route butuh login
router.use(authenticateToken);

router.get('/conversations', getConversations);           // Get List
router.post('/conversations', createConversation);        // New Chat
router.get('/conversations/:conversationId', getMessages); // Get Detail Chat
router.post('/messages', sendMessage);                     // Kirim Pesan

export default router;