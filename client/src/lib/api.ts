import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

// LOGIKA PINTAR:
// 1. Jika di Vercel/Production, gunakan URL dari Environment Variable.
// 2. Jika tidak ada, gunakan '/api' (agar Proxy Vite di localhost tetap jalan).
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR 1: OTOMATIS SISIPKAN TOKEN
// Setiap kali kirim request, tempelkan "Authorization: Bearer <token>"
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// INTERCEPTOR 2: HANDLE ERROR TOKEN
// Jika server menolak token (401), otomatis logout di frontend
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);