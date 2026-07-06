using System.ComponentModel.DataAnnotations.Schema;

namespace MiniERP.API.Entities
{
    public class Salary
    {
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        public int Month { get; set; }
        public int Year { get; set; }

        public double TotalWorkDays { get; set; } // Tổng số ngày đi làm thực tế (FullTime)

        public double TotalHours { get; set; } = 0; // Tổng số giờ làm việc thực tế (PartTime)

        [Column(TypeName = "decimal(18,2)")]
        public decimal AdvanceDeducted { get; set; } = 0; // Cột tiền khấu trừ từ tạm ứng

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; } // Tổng tiền lương nhận được

        public DateTime CalculatedAt { get; set; } = DateTime.Now; // Thời điểm chốt lương
        public bool IsPaid { get; set; } = false;

    }
}