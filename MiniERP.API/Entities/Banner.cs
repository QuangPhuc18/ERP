using System;
using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.Entities
{
    public class Banner
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Subtitle { get; set; }

        [MaxLength(50)]
        public string? ButtonText { get; set; }

        [MaxLength(200)]
        public string? ButtonLink { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsActive { get; set; } = true;
        
        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}
