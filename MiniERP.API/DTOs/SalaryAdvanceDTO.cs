using System;

namespace MiniERP.API.DTOs
{
    public class SalaryAdvanceDTO
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime AdvanceDate { get; set; }
        public string? Reason { get; set; }
        public bool IsDeducted { get; set; }
    }

    public class CreateSalaryAdvanceDTO
    {
        public int EmployeeId { get; set; }
        public decimal Amount { get; set; }
        public DateTime AdvanceDate { get; set; }
        public string? Reason { get; set; }
    }
}
