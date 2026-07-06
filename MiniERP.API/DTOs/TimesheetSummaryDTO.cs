namespace MiniERP.API.DTOs
{
    public class TimesheetSummaryDTO
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public double PosHours { get; set; }
        public double ManualHours { get; set; }
        public double TotalHours => PosHours + ManualHours;
    }
}
