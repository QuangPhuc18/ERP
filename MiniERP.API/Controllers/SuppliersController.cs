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
    [Authorize]
    public class SuppliersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SuppliersController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetAll() => Ok(await _context.Suppliers.ToListAsync());

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Create([FromBody] SupplierDTO dto)
        {
            if (await _context.Suppliers.AnyAsync(s => s.SupplierCode == dto.SupplierCode))
                return BadRequest("Mã nhà cung cấp đã tồn tại!");

            var supplier = new Supplier
            {
                SupplierCode = dto.SupplierCode,
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address
            };
            _context.Suppliers.Add(supplier);
            await _context.SaveChangesAsync();
            return Ok(supplier);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, [FromBody] SupplierDTO dto)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return NotFound("Không tìm thấy nhà cung cấp!");

            supplier.SupplierCode = dto.SupplierCode;
            supplier.Name = dto.Name;
            supplier.Email = dto.Email;
            supplier.Phone = dto.Phone;
            supplier.Address = dto.Address;

            _context.Suppliers.Update(supplier);
            await _context.SaveChangesAsync();
            return Ok(supplier);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var supplier = await _context.Suppliers.FindAsync(id);
            if (supplier == null) return NotFound("Không tìm thấy nhà cung cấp!");

            _context.Suppliers.Remove(supplier);
            await _context.SaveChangesAsync();
            return Ok("Xóa nhà cung cấp thành công!");
        }
    }
}