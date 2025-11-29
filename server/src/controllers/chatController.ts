import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';
import { generateResponse } from '../services/llmService';
// IMPORT PENTING: Fungsi pencari dokumen
import { searchSimilarDocuments } from '../services/ragService'; 

// --- 1. GET ALL CONVERSATIONS ---
export const getConversations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { messages: true } } }
    });
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

// --- 2. CREATE NEW CONVERSATION ---
export const createConversation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const newConv = await prisma.conversation.create({
      data: { userId: userId!, title: 'New Chat' }
    });
    res.status(201).json(newConv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create conversation' });
  }
};

// --- 3. GET MESSAGES ---
export const getMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId: req.user?.userId }
    });

    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

// --- 4. SEND MESSAGE (RAG ENABLED) ---
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { conversationId, content } = req.body;
    const userId = req.user?.userId;

    // A. Simpan Pesan User
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        content,
        tokenEstimate: content.length / 4 
      }
    });

    // B. RAG: Cari Data Relevan di PDF (Logika Inti)
    console.log(`[RAG] Searching knowledge for: "${content}"...`);
    const relevantDocs = await searchSimilarDocuments(content);
    console.log(`[RAG] Found ${relevantDocs.length} relevant chunks.`);

    // Susun teks konteks
    let contextText = "";
    if (relevantDocs.length > 0) {
      // Ambil isi dokumen dan gabungkan
      contextText = relevantDocs
        .map((doc: any) => `-- KUTIPAN DARI (${doc.filename}):\n"${doc.content}"`)
        .join("\n\n");
    }

    // C. Ambil Master Prompt
    const activePrompt = await prisma.masterPrompt.findFirst({
      where: { userId, isPinned: true }
    });

    const baseInstruction = activePrompt 
      ? activePrompt.content 
      : 'Kamu adalah asisten AI yang cerdas dan membantu.';

    // D. GABUNGKAN PROMPT + KONTEKS PDF
    const finalSystemPrompt = `${baseInstruction}

    INSTRUKSI TAMBAHAN (PENTING):
    ${contextText 
      ? `User telah mengupload dokumen referensi. Gunakan informasi berikut untuk menjawab pertanyaan user secara akurat:
      
      ${contextText}
      
      Jika jawaban ada di dalam referensi di atas, jawablah berdasarkan referensi tersebut. Jika tidak ada, gunakan pengetahuan umummu.` 
      : 'Jawablah berdasarkan pengetahuan umum karena tidak ada dokumen referensi yang relevan.'
    }`;

    // E. Ambil History Chat (Agar nyambung)
    const prevMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: 10 
    });

    // F. Format Pesan Akhir ke AI
    const formattedHistory = [
      { role: 'system', content: finalSystemPrompt },
      ...prevMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
    ];

    // G. Panggil AI
    // @ts-ignore
    const aiResponseText = await generateResponse(formattedHistory);

    // H. Simpan Jawaban AI
    const aiMessage = await prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: aiResponseText,
        tokenEstimate: aiResponseText.length / 4
      }
    });

    // I. Auto Rename (Jika chat baru)
    const messageCount = await prisma.message.count({ where: { conversationId } });
    if (messageCount <= 2) {
      const newTitle = content.substring(0, 30) + (content.length > 30 ? '...' : '');
      await prisma.conversation.update({ where: { id: conversationId }, data: { title: newTitle } });
    }

    res.json({ userMessage, aiMessage });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};