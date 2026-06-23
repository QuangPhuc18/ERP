import httpAxios from "./httpAxios";

const AuthService = {
  // 1. API Đăng nhập
  login: async (credentials: { username: string; password?: string }) => {
    const response = await httpAxios.post("/Auth/login", credentials);
    const token = response.data.token || response.data;

    if (token && typeof token === 'string') {
      localStorage.setItem("erp_token", token);
      localStorage.setItem("username", credentials.username);
      
      try {
        // Cắt lấy phần Payload của Token
        const payloadBase64 = token.split('.')[1]; 
        // Giải mã Base64 sang chuỗi JSON (Xử lý cả lỗi font Unicode)
        const decodedJson = decodeURIComponent(atob(payloadBase64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const payload = JSON.parse(decodedJson);
        
        // 🎯 VÉT CẠN: Tìm Role theo mọi định dạng có thể của C#
        const role = payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] 
                  || payload["role"] 
                  || payload["Role"] 
                  || "user"; // Nếu tìm không ra thì mặc định là user
        
        // Cất vào két sắt
        localStorage.setItem("user_role", role.toLowerCase()); 
        
      } catch (e) {
        console.error("Lỗi giải mã Token:", e);
        localStorage.setItem("user_role", "user");
      }
    }
    return response.data;
  },  

  // 2. API Đăng ký (Cấp tài khoản mới)
  register: async (userData: { username: string; password?: string; role: string; employeeId: number }) => {
    const response = await httpAxios.post("/Auth/register", userData);
    return response.data;
  },

  // 3. Hàm Đăng xuất nhanh
  logout: () => {
    localStorage.removeItem("erp_token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_role"); // Đã bổ sung xóa quyền
    window.location.href = "/auth/login"; 
  }
};

export default AuthService;