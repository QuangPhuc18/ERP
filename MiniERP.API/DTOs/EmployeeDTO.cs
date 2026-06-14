namespace MiniERP.API.DTOs
{
    public class EmployeeDTO
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        // Thay vì trả về nguyên object Department, ta chỉ trả về cái tên cho gọn nhẹ
        public string DepartmentName { get; set; } = string.Empty;
        public decimal DailySalary { get; set; }
        public string DepartmentId { get; set; } = string.Empty; // 🎯 Dòng quan trọng để Frontend bắt được ID phòng ban
    }
}