import { create } from 'zustand';

interface User {
  id: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Cek apakah ada data tersimpan di LocalStorage saat aplikasi mulai
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),

  login: (user, token) => {
    // Simpan ke LocalStorage (Persistensi)
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    
    // Simpan ke State aplikasi
    set({ user, token });
  },

  logout: () => {
    // Hapus dari LocalStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Reset State
    set({ user: null, token: null });
  },
}));