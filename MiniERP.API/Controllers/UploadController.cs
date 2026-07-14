using Microsoft.AspNetCore.Mvc;

namespace MiniERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public UploadController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost("image")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Không có file được tải lên.");

            // Kiểm tra định dạng
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(extension))
                return BadRequest("Chỉ hỗ trợ file ảnh (.jpg, .png, .gif, .webp)");

            // Tạo thư mục nếu chưa có
            var uploadPath = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads");
            if (!Directory.Exists(uploadPath))
            {
                Directory.CreateDirectory(uploadPath);
            }

            // Tạo tên file mới
            var newFileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(uploadPath, newFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Trả về URL dạng: http://localhost:5121/uploads/ten-file.png
            var url = $"{Request.Scheme}://{Request.Host}/uploads/{newFileName}";

            return Ok(new { url = url });
        }
    }
}
