using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MiniERP.API.Entities
{
    [Table("StoreSettings")]
    public class StoreSetting
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string StoreName { get; set; } = "NexERP Tạp Hóa";

        [MaxLength(500)]
        public string Slogan { get; set; } = "Uy tín, chất lượng, minh bạch.";

        [MaxLength(500)]
        public string Address { get; set; } = "123 Đường Bán Lẻ, TP.HCM";

        [MaxLength(50)]
        public string Phone { get; set; } = "0909 123 456";

        [MaxLength(100)]
        public string Email { get; set; } = "contact@nexerp.com";

        [MaxLength(200)]
        public string FacebookUrl { get; set; } = "https://facebook.com";

        [MaxLength(500)]
        public string LogoUrl { get; set; } = "storefront"; // Default is the text or an icon name, can be changed to https://... image URL
    }
}
