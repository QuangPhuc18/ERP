namespace MiniERP.API.DTOs
{
    public class ProjectDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        // Danh sách các nhân viên đang tham gia dự án này
        public List<EmployeeInProjectDTO> Employees { get; set; } = new List<EmployeeInProjectDTO>();
    }

    // Class phụ: Chỉ lấy Tên và Vai trò của nhân viên, không lấy toàn bộ thông tin nhạy cảm
    public class EmployeeInProjectDTO
    {
        public int EmployeeId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}