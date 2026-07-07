using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.DTOs;
using MiniERP.API.Entities;
using System.Threading.Tasks;
using System.Linq;

namespace MiniERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BannersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BannersController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách Banner (Dành cho Admin)
        [HttpGet]
        [Authorize(Roles = "admin,manager,staff")]
        public async Task<IActionResult> GetAll()
        {
            var banners = await _context.Banners.OrderByDescending(b => b.CreatedAt).ToListAsync();
            return Ok(banners);
        }

        // Thêm Banner mới
        [HttpPost]
        [Authorize(Roles = "admin,manager")]
        public async Task<IActionResult> Create([FromBody] BannerDTO dto)
        {
            var banner = new Banner
            {
                Title = dto.Title,
                Subtitle = dto.Subtitle,
                ButtonText = dto.ButtonText,
                ButtonLink = dto.ButtonLink,
                ImageUrl = dto.ImageUrl,
                IsActive = dto.IsActive
            };
            _context.Banners.Add(banner);
            await _context.SaveChangesAsync();
            return Ok(banner);
        }

        // Cập nhật Banner
        [HttpPut("{id}")]
        [Authorize(Roles = "admin,manager")]
        public async Task<IActionResult> Update(int id, [FromBody] BannerDTO dto)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null) return NotFound("Không tìm thấy Banner!");

            banner.Title = dto.Title;
            banner.Subtitle = dto.Subtitle;
            banner.ButtonText = dto.ButtonText;
            banner.ButtonLink = dto.ButtonLink;
            banner.ImageUrl = dto.ImageUrl;
            
            _context.Banners.Update(banner);
            await _context.SaveChangesAsync();
            return Ok(banner);
        }

        // Xóa Banner
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null) return NotFound("Không tìm thấy Banner!");

            _context.Banners.Remove(banner);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đã xóa Banner thành công!" });
        }

        // Thay đổi trạng thái (Bật/Tắt hiển thị)
        [HttpPut("{id}/toggle-status")]
        [Authorize(Roles = "admin,manager")]
        public async Task<IActionResult> ToggleStatus(int id)
        {
            var banner = await _context.Banners.FindAsync(id);
            if (banner == null) return NotFound("Không tìm thấy Banner!");

            banner.IsActive = !banner.IsActive;
            _context.Banners.Update(banner);
            await _context.SaveChangesAsync();

            return Ok(new { Message = banner.IsActive ? "Đã bật hiển thị Banner!" : "Đã ẩn Banner!", IsActive = banner.IsActive });
        }
    }
}
