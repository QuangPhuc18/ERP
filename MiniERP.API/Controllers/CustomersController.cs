using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.Entities;

namespace MiniERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Bảo mật API - Yêu cầu Token hợp lệ
    public class CustomersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CustomersController(AppDbContext context)
        {
            _context = context;
        }

        // 🚀 1. READ ALL: Lấy danh sách toàn bộ khách hàng
        [HttpGet]
        public async Task<IActionResult> GetCustomers()
        {
            var customers = await _context.Customers
                .OrderByDescending(c => c.Id)
                .ToListAsync();
            return Ok(customers);
        }

        // 🚀 2. READ SINGLE: Lấy thông tin chi tiết 1 khách hàng theo Id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCustomerById(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound("Không tìm thấy khách hàng yêu cầu.");
            }
            return Ok(customer);
        }

        // 🚀 3. CREATE: Thêm mới khách hàng (Hỗ trợ cả POS và trang quản lý)
        [HttpPost]
        public async Task<IActionResult> CreateCustomer([FromBody] Customer customer)
        {
            // Kiểm tra trùng số điện thoại
            bool isPhoneExist = await _context.Customers.AnyAsync(c => c.Phone == customer.Phone);
            if (isPhoneExist)
            {
                return BadRequest("Số điện thoại này đã được đăng ký thẻ thành viên!");
            }

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return Ok(customer);
        }

        // 🚀 4. UPDATE: Cập nhật thông tin khách hàng cũ
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomer(int id, [FromBody] Customer customerData)
        {
            var existingCustomer = await _context.Customers.FindAsync(id);
            if (existingCustomer == null)
            {
                return NotFound("Không tìm thấy khách hàng cần cập nhật.");
            }

            // Kiểm tra trùng số điện thoại với người khác khi đổi số điện thoại mới
            bool isPhoneExist = await _context.Customers
                .AnyAsync(c => c.Phone == customerData.Phone && c.Id != id);
            if (isPhoneExist)
            {
                return BadRequest("Số điện thoại này đã được một thành viên khác sử dụng!");
            }

            // Cập nhật các thông tin thay đổi
            existingCustomer.CustomerCode = customerData.CustomerCode;
            existingCustomer.FullName = customerData.FullName;
            existingCustomer.Phone = customerData.Phone;
            existingCustomer.Email = customerData.Email;
            existingCustomer.Address = customerData.Address;

            await _context.SaveChangesAsync();
            return Ok(existingCustomer);
        }

        // 🚀 5. DELETE: Xóa khách hàng khỏi hệ thống
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                return NotFound("Không tìm thấy khách hàng cần xóa.");
            }

            // Kiểm tra ràng buộc: Nếu khách này đã từng mua hàng, không cho xóa để tránh lỗi dữ liệu hóa đơn
            bool hasOrders = await _context.Orders.AnyAsync(o => o.CustomerId == id);
            if (hasOrders)
            {
                return BadRequest("Không thể xóa khách hàng này vì lịch sử mua hàng của họ đã được lưu trên hệ thống hóa đơn!");
            }

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();

            return Ok("Đã xóa khách hàng thành công.");
        }
    }
}