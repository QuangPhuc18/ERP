using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs
{
    public class CreateEmployeeDTO
    {
        [Required(ErrorMessage = "Tên nhân viên không được để trống")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email không được để trống")]
        [EmailAddress(ErrorMessage = "Định dạng email không hợp lệ")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng chọn phòng ban")]
        public int DepartmentId { get; set; }
        public decimal DailySalary { get; set; }
        public string EmployeeType { get; set; } = "FullTime";
        public decimal HourlyRate { get; set; }
    }
}