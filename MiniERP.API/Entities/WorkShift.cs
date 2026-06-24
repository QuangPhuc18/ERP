using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MiniERP.API.Entities
{
    public class WorkShift
    {
        [Key]
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        
        [MaxLength(100)]
        public string EmployeeName { get; set; } = string.Empty;

        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }

        // Tiền lẻ đầu ca
        [Column(TypeName = "decimal(18,2)")]
        public decimal StartingCash { get; set; }

        // Tiền hệ thống tự tính toán được trong ca
        [Column(TypeName = "decimal(18,2)")]
        public decimal ExpectedCash { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal ExpectedTransfer { get; set; }
        [Column(TypeName = "decimal(18,2)")]
        public decimal ExpectedDebt { get; set; }

        // Tiền thực tế thu ngân đếm được và gõ vào
        [Column(TypeName = "decimal(18,2)")]
        public decimal ActualCash { get; set; }

        // Độ chênh lệch (ActualCash - ExpectedCash)
        [Column(TypeName = "decimal(18,2)")]
        public decimal Variance { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Open"; // Open, Closed
    }
}
