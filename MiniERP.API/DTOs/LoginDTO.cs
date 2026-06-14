using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.DTOs
{
    public class LoginDTO
    {
        [Required(ErrorMessage = "Vui lòng nhập tài khoản")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "Vui lòng nhập mật khẩu")]
        public string Password { get; set; } = string.Empty;
    }
}