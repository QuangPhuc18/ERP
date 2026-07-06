using System;

namespace MiniERP.API.DTOs
{
    public class TimesheetLogDTO
    {
        public DateTime Date { get; set; }
        public string Source { get; set; } = string.Empty; // "Tự động từ POS" hoặc "Bù giờ thủ công"
        public double Hours { get; set; }
        public string Details { get; set; } = string.Empty; // Ví dụ: "08:00 - 12:00" hoặc lý do bù giờ
    }
}
