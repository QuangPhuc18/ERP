using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.Entities
{
    public class Timesheet
    {
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        [Required]
        public DateTime Date { get; set; } // Ngày chấm công

        [Required]
        public string Status { get; set; } = "Present"; // Trạng thái: Present (Có mặt), Absent (Vắng), Half-day (Nửa ngày)

        public string Note { get; set; } = string.Empty; // Ghi chú đi trễ, về sớm...
    }
}