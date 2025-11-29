import { create } from 'zustand';
import { api } from '@/lib/api'; // Menggunakan API Client pusat

interface Prompt {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
}

interface PromptState {
  prompts: Prompt[];
  isLoading: boolean;
  fetchPrompts: () => Promise<void>;
  createPrompt: (title: string, content: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
}

export const usePromptStore = create<PromptState>((set, get) => ({
  prompts: [],
  isLoading: false,

  // Fetch semua prompt
  fetchPrompts: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/prompts');
      set({ prompts: res.data });
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  // Buat prompt baru
  createPrompt: async (title, content) => {
    try {
      await api.post('/prompts', { title, content });
      get().fetchPrompts(); // Refresh list agar prompt baru muncul
    } catch (err) {
      console.error('Failed to create prompt:', err);
    }
  },

  // Toggle Pin (Aktif/Nonaktif)
  togglePin: async (id) => {
    try {
      // Panggil endpoint toggle di backend
      await api.patch(`/prompts/${id}/pin`);
      
      // Refresh list untuk mendapatkan status terbaru dari server
      // (Backend akan menangani logika unpin prompt lain secara otomatis)
      get().fetchPrompts(); 
    } catch (err) {
      console.error('Failed to toggle pin:', err);
    }
  }
}));