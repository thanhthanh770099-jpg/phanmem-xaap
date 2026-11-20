// Khi chạy trên domain riêng (vd: apthongminh.vnptvinhlong.vn) hoặc Vite dev (proxy /api -> localhost:3000),
// dùng đường dẫn tương đối '' để gọi trực tiếp API cùng domain.
// Khi chạy trên Vercel, gọi sang backend Render (hoặc biến VITE_API_URL nếu có).
const isVercel = typeof window !== 'undefined' && window.location.hostname.endsWith('.vercel.app');

export const API_BASE = import.meta.env.VITE_API_URL || (isVercel ? 'https://phanmem-xaap.onrender.com' : '');
