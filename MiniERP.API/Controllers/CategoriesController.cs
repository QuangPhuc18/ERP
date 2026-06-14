using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.DTOs;
using MiniERP.API.Entities;

namespace MiniERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Ai đăng nhập rồi cũng được xem
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy danh sách (Dành cho cả User và Admin)
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _context.Categories.ToListAsync();
            return Ok(categories);
        }
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,admin")]
          public async Task<IActionResult> Update(int id, [FromBody] CategoryDTO dto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();
            category.Name = dto.Name;
            await _context.SaveChangesAsync();
            return Ok(category);
        }
        // Thêm mới (CHỈ ADMIN)
        [HttpPost]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> Create([FromBody] CategoryDTO dto)
        {
            var category = new Category { Name = dto.Name };
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(category);
        }
    }
}