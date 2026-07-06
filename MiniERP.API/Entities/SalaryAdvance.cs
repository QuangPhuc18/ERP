using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MiniERP.API.Entities
{
    public class SalaryAdvance
    {
        [Key]
        public int Id { get; set; }

        public int EmployeeId { get; set; }

        [ForeignKey("EmployeeId")]
        public Employee? Employee { get; set; }

        public decimal Amount { get; set; }

        public DateTime AdvanceDate { get; set; }

        public string? Reason { get; set; }
        
        // 🎯 Cờ đánh dấu khoản tạm ứng này đã được cấn trừ vào lương cuối tháng chưa
        public bool IsDeducted { get; set; } = false;
    }
}
