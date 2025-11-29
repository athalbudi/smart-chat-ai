import { create } from 'zustand';
import { api } from '@/lib/api'; // <--- Gunakan API Client pusat

// Definisi Tipe Data
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string;
  updatedAt: string;
}

interface ChatState {
  conversations: Conversation[];
  messages: Message[];
  activeId: string | null;
  isLoading: boolean;
  
  fetchConversations: () => Promise<void>;
  createConversation: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
}

// Tidak butuh helper getHeaders() lagi karena api.ts sudah menangani token otomatis

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  messages: [],
  activeId: null,
  isLoading: false,

  // 1. Ambil Daftar Chat (Sidebar)
  fetchConversations: async () => {
    try {
      // Panggil endpoint relatif (api.ts sudah set baseURL='/api')
      const res = await api.get('/chat/conversations');
      set({ conversations: res.data });
    } catch (err) {
      console.error('Gagal ambil percakapan:', err);
    }
  },

  // 2. Buat Chat Baru
  createConversation: async () => {
    try {
      const res = await api.post('/chat/conversations', {});
      const newChat = res.data;
      
      // Update state: Tambah chat baru di paling atas, set jadi aktif
      set((state) => ({
        conversations: [newChat, ...state.conversations],
        activeId: newChat.id,
        messages: [] // Kosongkan layar pesan
      }));
    } catch (err) {
      console.error('Gagal buat chat:', err);
    }
  },

  // 3. Pilih Chat dari Sidebar
  selectConversation: async (id) => {
    set({ activeId: id, isLoading: true });
    try {
      const res = await api.get(`/chat/conversations/${id}`);
      set({ messages: res.data });
    } catch (err) {
      console.error('Gagal ambil pesan:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // 4. Kirim Pesan
  sendMessage: async (content) => {
    const { activeId, messages } = get();
    if (!activeId) return;

    // Optimistic UI: Tampilkan pesan user DULUAN sebelum server membalas
    const tempId = Date.now().toString();
    const optimisticMsg: Message = {
      id: tempId,
      role: 'user',
      content,
      createdAt: new Date().toISOString()
    };

    set({ messages: [...messages, optimisticMsg] });

    try {
      // Kirim ke Backend via api client
      const res = await api.post('/chat/messages', {
        conversationId: activeId,
        content
      });

      const { userMessage, aiMessage } = res.data;

      // Update state dengan data asli dari server (ganti optimistic msg)
      set((state) => ({
        messages: [...state.messages.filter(m => m.id !== tempId), userMessage, aiMessage]
      }));
      
    } catch (err) {
      console.error('Gagal kirim pesan:', err);
    }
  }
}));