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

        public DateTime? CheckInTime { get; set; } // Giờ bấm vân tay vào
        
        public DateTime? CheckOutTime { get; set; } // Giờ bấm vân tay ra

        public double TotalHours { get; set; } = 0; // Tổng số giờ làm việc thực tế

        public string Note { get; set; } = string.Empty; // Ghi chú đi trễ, về sớm...
    }
}