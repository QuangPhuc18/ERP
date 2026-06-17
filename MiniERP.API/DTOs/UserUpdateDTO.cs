namespace MiniERP.API.DTOs
{
    public class UserUpdateDTO
    {
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = "staff";
        public string Position { get; set; } = "Nhân viên";
        public bool IsActive { get; set; } = true; // Để admin kích hoạt hoặc khóa tài khoản
        public string? NewPassword { get; set; } // Nếu điền thì đổi mật khẩu, để trống thì giữ nguyên
    }
}