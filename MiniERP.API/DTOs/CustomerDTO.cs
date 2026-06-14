namespace MiniERP.API.DTOs
{
    public class CustomerDTO
    {
        // 🎯 THÊM 2 DÒNG NÀY VÀO ĐỂ FIX LỖI
        public int Id { get; set; }
        public string? CustomerCode { get; set; }

        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Address { get; set; }
    }
}