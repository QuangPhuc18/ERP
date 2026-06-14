using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniERP.API.Entities;
using MiniERP.API.Repositories;

namespace MiniERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentsController : ControllerBase
    {
        private readonly IDepartmentRepository _repository;

        // Tiêm Repository vào Controller
        public DepartmentsController(IDepartmentRepository repository)
        {
            _repository = repository;
        }

        // API Lấy danh sách tất cả phòng ban
        // GET: api/departments
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var departments = await _repository.GetAllAsync();
            return Ok(departments);
        }

        // API Thêm mới một phòng ban
        // POST: api/departments
        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Create(Department department)
        {
            // Tạm thời bỏ qua danh sách nhân viên khi mới tạo phòng ban
            department.Employees = null;

            await _repository.AddAsync(department);
            return Ok(department);
        }
        // API Lấy thông tin 1 phòng ban theo Id
        // GET: api/departments/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var department = await _repository.GetByIdAsync(id);
            if (department == null) return NotFound(); // Trả về lỗi 404 nếu không tìm thấy

            return Ok(department);
        }

        // API Cập nhật thông tin phòng ban
        // PUT: api/departments/5
        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(int id, Department department)
        {
            // Kiểm tra xem Id trên URL có khớp với Id trong cục dữ liệu gửi lên không
            if (id != department.Id) return BadRequest("ID không khớp!");

            var existingDept = await _repository.GetByIdAsync(id);
            if (existingDept == null) return NotFound("Không tìm thấy phòng ban!");

            // Tạm bỏ qua danh sách nhân viên để tránh lỗi khi update
            department.Employees = null;

            // Thực hiện update (Lưu ý: EF Core theo dõi entity nên cần detach cái cũ ra để tránh lỗi tracking, 
            // nhưng vì ở đây chúng ta viết gọn nên dùng cách gán giá trị mới)
            existingDept.Name = department.Name;
            existingDept.Description = department.Description;

            await _repository.UpdateAsync(existingDept);
            return NoContent(); // Code 204: Báo hiệu update thành công và không cần trả về data
        }

        // API Xóa phòng ban
        // DELETE: api/departments/5
        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var existingDept = await _repository.GetByIdAsync(id);
            if (existingDept == null) return NotFound("Không tìm thấy phòng ban!");

            await _repository.DeleteAsync(id);
            return NoContent(); // Trả về 204 Thành công
        }
    }
}