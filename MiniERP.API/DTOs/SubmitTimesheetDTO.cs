using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs
{
    public class SubmitTimesheetDTO
    {
        [Required]
        public int EmployeeId { get; set; }

        [Required]
        public DateTime Date { get; set; } // Ngày chấm công

        [Required]
        // Trạng thái chỉ được nhập 1 trong 3: Present, Half-day, Absent
        public string Status { get; set; } = "Present";

        public string Note { get; set; } = string.Empty;
    }
}