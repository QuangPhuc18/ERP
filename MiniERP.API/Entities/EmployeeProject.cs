namespace MiniERP.API.Entities
{
    public class EmployeeProject
    {
        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; } 

        public int ProjectId { get; set; }
        public Project? Project { get; set; }

        // Bạn có thể mở rộng thêm dữ liệu tại đây (Ví dụ: Vai trò)
        public string Role { get; set; } = "Thành viên";
    }
}