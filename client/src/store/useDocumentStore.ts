import { create } from 'zustand';
import { api } from '@/lib/api'; // Menggunakan API Client pusat

interface DocumentState {
  isUploading: boolean;
  uploadProgress: string;
  uploadDocument: (file: File) => Promise<void>;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  isUploading: false,
  uploadProgress: '',

  uploadDocument: async (file) => {
    set({ isUploading: true, uploadProgress: 'Uploading & Processing...' });
    try {
      const formData = new FormData();
      formData.append('pdf', file);

      // Gunakan api instance.
      // Kita override header Content-Type karena default-nya application/json,
      // sedangkan upload file butuh multipart/form-data.
      await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      set({ uploadProgress: 'Success! Knowledge added.' });
      
      // Reset status setelah 3 detik
      setTimeout(() => set({ uploadProgress: '' }), 3000);
    } catch (err) {
      console.error(err);
      set({ uploadProgress: 'Failed to upload.' });
    } finally {
      set({ isUploading: false });
    }
  }
}));