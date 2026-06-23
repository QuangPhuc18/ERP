import axios from 'axios';

// Khởi tạo một instance riêng biệt cho hệ thống ERP
const httpAxios = axios.create({
  // URL trỏ thẳng về Backend C# (Có thể sửa thành file .env sau)
  baseURL: 'https://localhost:7280/api', 
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request Interceptor: Bảo vệ cửa ra
// Tự động gắn thẻ Token vào mọi Request trước khi nó bay lên Server C#
httpAxios.interceptors.request.use(
  (config) => {
    // Chỉ lấy localStorage khi chạy trên trình duyệt (tránh lỗi Next.js SSR)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('erp_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Bảo vệ cửa vào
// Tóm gọn mọi dữ liệu Server trả về, xử lý lỗi 401 (Hết hạn Token)
httpAxios.interceptors.response.use(
  (response) => {
    // Nếu API C# của bạn thường bọc dữ liệu trong response.data (ví dụ: { message: "...", data: [...] })
    // Bạn có thể return response.data luôn ở đây cho gọn, nhưng tạm thời cứ giữ nguyên response.
    return response; 
  },
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      console.warn("Token đã hết hạn hoặc không hợp lệ. Đăng xuất!");
      localStorage.removeItem('erp_token');
      // Tự động đẩy người dùng văng ra trang Login
      window.location.href = "/"; 
    }
    return Promise.reject(error);
  }
);

export default httpAxios;