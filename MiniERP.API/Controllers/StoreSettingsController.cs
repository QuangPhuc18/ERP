using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.Entities;

namespace MiniERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StoreSettingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public StoreSettingsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/StoreSettings
        [HttpGet]
        public async Task<ActionResult<StoreSetting>> GetStoreSetting()
        {
            var setting = await _context.StoreSettings.FirstOrDefaultAsync(s => s.Id == 1);
            if (setting == null)
            {
                return NotFound();
            }
            return setting;
        }

        // PUT: api/StoreSettings
        [HttpPut]
        public async Task<IActionResult> UpdateStoreSetting([FromBody] StoreSetting updatedSetting)
        {
            var setting = await _context.StoreSettings.FirstOrDefaultAsync(s => s.Id == 1);
            if (setting == null)
            {
                // Nếu chưa có thì tạo mới (Id=1)
                updatedSetting.Id = 1;
                _context.StoreSettings.Add(updatedSetting);
            }
            else
            {
                setting.StoreName = updatedSetting.StoreName;
                setting.Slogan = updatedSetting.Slogan;
                setting.Address = updatedSetting.Address;
                setting.Phone = updatedSetting.Phone;
                setting.Email = updatedSetting.Email;
                setting.FacebookUrl = updatedSetting.FacebookUrl;
                setting.LogoUrl = updatedSetting.LogoUrl;
            }

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { Message = "Cập nhật cấu hình cửa hàng thành công!" });
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"Lỗi cập nhật: {ex.Message}");
            }
        }
    }
}
