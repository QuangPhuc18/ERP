import axios from 'axios';

// Khởi tạo một instance riêng biệt cho hệ thống ERP
const httpAxios = axios.create({
  // URL trỏ thẳng về Backend C# (Có thể sửa thành file .env sau)
  baseURL: '/api', 
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

const replaceUrls = (obj: any): any => {
  if (typeof obj === 'string') {
    return obj.replace(/http:\/\/api-nexerp\.somee\.com\//g, '/');
  }
  if (Array.isArray(obj)) {
    return obj.map(replaceUrls);
  }
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      newObj[key] = replaceUrls(obj[key]);
    }
    return newObj;
  }
  return obj;
};

// Response Interceptor: Bảo vệ cửa vào
// Tóm gọn mọi dữ liệu Server trả về, xử lý lỗi 401 (Hết hạn Token)
httpAxios.interceptors.response.use(
  (response) => {
    // Tự động chuyển đổi toàn bộ URL ảnh thành đường dẫn tương đối để tránh Mixed Content
    if (response.data) {
      response.data = replaceUrls(response.data);
    }
    return response; 
  },
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      const configUrl = error.config?.url || "";
      // Không tự động redirect nếu đang gọi API login (sai pass)
      if (!configUrl.toLowerCase().includes("login")) {
        console.warn("Token đã hết hạn hoặc không hợp lệ. Đăng xuất!");
        localStorage.removeItem('erp_token');
        
        // Nhảy đúng trang login tùy theo khu vực đang đứng
        if (window.location.pathname.startsWith("/storefront")) {
          window.location.href = "/storefront/auth/login";
        } else {
          window.location.href = "/auth/login"; 
        }
      }
    }
    return Promise.reject(error);
  }
);

export default httpAxios;