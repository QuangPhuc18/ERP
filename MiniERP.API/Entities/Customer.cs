using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.Entities
{
    public class Customer
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string CustomerCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Email { get; set; }

        [MaxLength(20)]
        public string? Phone { get; set; }

        [MaxLength(255)]
        public string? Address { get; set; }

        public string? PasswordHash { get; set; } // Hỗ trợ KH đăng nhập Storefront
        public int RewardPoints { get; set; } = 0; // Điểm tích lũy
        [MaxLength(50)]
        public string MembershipTier { get; set; } = "Bronze"; // Hạng thành viên
    }
}