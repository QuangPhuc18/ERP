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
        public DateTime CheckInTime { get; set; } // Bắt buộc phải có giờ vào

        public DateTime? CheckOutTime { get; set; } // Giờ ra có thể để trống nếu chưa về

        public double BreakHours { get; set; } = 0; // Thời gian nghỉ trưa/nghỉ giữa ca (Giờ)

        public string Note { get; set; } = string.Empty;
    }
}