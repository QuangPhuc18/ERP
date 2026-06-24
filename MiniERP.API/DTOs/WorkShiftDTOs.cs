using System;
using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs
{
    public class WorkShiftCreateDTO
    {
        public decimal StartingCash { get; set; }
    }

    public class WorkShiftCloseDTO
    {
        public decimal ActualCash { get; set; }
    }

    public class WorkShiftDTO
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public decimal StartingCash { get; set; }
        public decimal ExpectedCash { get; set; }
        public decimal ExpectedTransfer { get; set; }
        public decimal ExpectedDebt { get; set; }
        public decimal ActualCash { get; set; }
        public decimal Variance { get; set; }
        public string Status { get; set; } = string.Empty;
    }
}
