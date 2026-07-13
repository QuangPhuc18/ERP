namespace MiniERP.API.DTOs
{
    public class TimesheetSummaryDTO
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public double ScheduledHours { get; set; } // Tổng số giờ theo lịch xếp
        public double PosHours { get; set; } // Giờ tính lương
        public double ManualHours { get; set; }
        public double TotalHours => PosHours + ManualHours;
    }
}
