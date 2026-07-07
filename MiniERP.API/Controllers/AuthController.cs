using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization; // Khai báo thêm thư viện phân quyền
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MiniERP.API.Data;
using MiniERP.API.DTOs;
using MiniERP.API.Entities;

namespace MiniERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _context;

        public AuthController(IConfiguration configuration, AppDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        // ==========================================================
        // 1. API ĐĂNG KÝ (CHỈ ADMIN MỚI ĐƯỢC PHÉP TRUY CẬP)
        // ==========================================================
        [HttpPost("register")]
        [Authorize(Roles = "admin")] // <-- CHỐT GÁC BẢO VỆ: Khóa mõm các luồng truy cập trái phép
        public async Task<IActionResult> Register([FromBody] RegisterDTO request)
        {
            if (await _context.Accounts.AnyAsync(a => a.EmployeeId == request.EmployeeId))
                return BadRequest("Nhân viên này đã được cấp tài khoản!");

            if (await _context.Accounts.AnyAsync(a => a.Username == request.Username))
                return BadRequest("Tên đăng nhập đã tồn tại trong hệ thống!");

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var account = new Account
            {
                EmployeeId = request.EmployeeId,
                Username = request.Username,
                PasswordHash = passwordHash,
                // Ép kiểu chữ thường để đồng bộ với logic Frontend (admin, user)
                Role = request.Role.ToLower()
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();

            return Ok("Tạo tài khoản thành công!");
        }


        // ==========================================================
        // 2. API ĐĂNG NHẬP (PUBLIC - AI CŨNG VÀO ĐƯỢC ĐỂ LẤY TOKEN)
        // ==========================================================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO login)
        {
            var account = await _context.Accounts.SingleOrDefaultAsync(a => a.Username == login.Username);

            if (account == null || !BCrypt.Net.BCrypt.Verify(login.Password, account.PasswordHash))
            {
                return Unauthorized("Tài khoản hoặc mật khẩu không chính xác!");
            }

            var token = GenerateJwtToken(account);

            // Trả về theo chuẩn Object { token: "..." } mà Frontend đang bắt
            return Ok(new { Token = token, Message = "Đăng nhập thành công!" });
        }


        // ==========================================================
        // HÀM TIỆN ÍCH: ĐÚC THẺ JWT TOKEN
        // ==========================================================
        private string GenerateJwtToken(Account account)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, account.Username),
                // Nhét Quyền (Role) vào Payload để Frontend giải mã
                new Claim(ClaimTypes.Role, account.Role),
                new Claim("EmployeeId", account.EmployeeId.ToString()), // Nhét thêm EmployeeId để sau này dễ truy vấn
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(8), // Nâng hạn mức lên 8 tiếng (1 ngày làm việc)
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        // ==========================================================
        // 3. API ĐĂNG KÝ CHO KHÁCH HÀNG (STOREFRONT)
        // ==========================================================
        public class CustomerRegisterDTO
        {
            public string FullName { get; set; } = null!;
            public string Phone { get; set; } = null!;
            public string Password { get; set; } = null!;
        }

        [HttpPost("customer/register")]
        public async Task<IActionResult> CustomerRegister([FromBody] CustomerRegisterDTO request)
        {
            if (await _context.Customers.AnyAsync(c => c.Phone == request.Phone))
                return BadRequest("Số điện thoại này đã được đăng ký!");

            string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            var customer = new Customer
            {
                CustomerCode = "CUS_" + DateTime.Now.Ticks.ToString().Substring(8),
                FullName = request.FullName,
                Phone = request.Phone,
                PasswordHash = passwordHash
            };
            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đăng ký thành công!" });
        }

        // ==========================================================
        // 4. API ĐĂNG NHẬP CHO KHÁCH HÀNG (STOREFRONT)
        // ==========================================================
        public class CustomerLoginDTO
        {
            public string Phone { get; set; } = null!;
            public string Password { get; set; } = null!;
        }

        [HttpPost("customer/login")]
        public async Task<IActionResult> CustomerLogin([FromBody] CustomerLoginDTO login)
        {
            var customer = await _context.Customers.SingleOrDefaultAsync(c => c.Phone == login.Phone);

            if (customer == null || customer.PasswordHash == null || !BCrypt.Net.BCrypt.Verify(login.Password, customer.PasswordHash))
            {
                return Unauthorized(new { Message = "Số điện thoại hoặc mật khẩu không chính xác!" });
            }

            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, customer.Phone),
                new Claim(ClaimTypes.Role, "customer"),
                new Claim("CustomerId", customer.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(24),
                signingCredentials: creds
            );
            
            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new { Token = tokenString, Message = "Đăng nhập thành công!", CustomerName = customer.FullName });
        }
    }
}