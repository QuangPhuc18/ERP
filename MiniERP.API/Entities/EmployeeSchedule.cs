using System;
using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.Entities
{
    public class EmployeeSchedule
    {
        [Key]
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        [Required]
        public TimeSpan EndTime { get; set; }

        [MaxLength(50)]
        public string Status { get; set; } = "Scheduled";

        [MaxLength(255)]
        public string? Notes { get; set; }
    }
}
