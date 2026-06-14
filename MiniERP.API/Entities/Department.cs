using System.ComponentModel.DataAnnotations; // Bắt buộc thêm thư viện này

namespace MiniERP.API.Entities
{
    public class Department
    {
        [Key] // Đánh dấu rõ ràng đây là Khóa chính
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        public ICollection<Employee>? Employees { get; set; }
    }
}