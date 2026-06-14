using System.ComponentModel.DataAnnotations; // Bắt buộc thêm thư viện này
using System.ComponentModel.DataAnnotations.Schema;
namespace MiniERP.API.Entities
{
    public class Employee
    {
        [Key] // Đánh dấu Khóa chính
        public int Id { get; set; }

        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;

        // Khóa ngoại
        public int DepartmentId { get; set; }
        public Department? Department { get; set; }
        public ICollection<EmployeeProject>? EmployeeProjects { get; set; }
        public Account? Account { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal DailySalary { get; set; } = 300000; // Mặc định 300k/ngày

        // THÊM: Thuộc tính điều hướng (1 Nhân viên có nhiều ngày chấm công, nhiều phiếu lương)
        public ICollection<Timesheet>? Timesheets { get; set; }
        public ICollection<Salary>? Salaries { get; set; }
    }
}