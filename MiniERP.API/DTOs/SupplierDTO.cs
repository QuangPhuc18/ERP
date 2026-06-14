using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs
{
    public class SupplierDTO
    {
        [Required(ErrorMessage = "Mã nhà cung cấp là bắt buộc")]
        public string SupplierCode { get; set; } = string.Empty;

        [Required(ErrorMessage = "Tên nhà cung cấp là bắt buộc")]
        public string Name { get; set; } = string.Empty;

        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
    }
}