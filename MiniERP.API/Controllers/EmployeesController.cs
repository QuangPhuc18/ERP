using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniERP.API.DTOs;
using MiniERP.API.Entities;
using MiniERP.API.Repositories;

namespace MiniERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Khóa bảo vệ chung: Yêu cầu phải đăng nhập
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeRepository _repository;

        public EmployeesController(IEmployeeRepository repository)
        {
            _repository = repository;
        }

        // CHỈ ADMIN MỚI ĐƯỢC THÊM HÀNG LOẠT
        // CHỈ ADMIN MỚI ĐƯỢC THÊM HÀNG LOẠT
        [HttpPost("bulk")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> CreateBulk(List<CreateEmployeeDTO> createDtos)
        {
            if (createDtos == null || createDtos.Count == 0)
                return BadRequest("Danh sách nhân viên không được để trống!");

            var employees = createDtos.Select(dto => new Employee
            {
                FullName = dto.FullName,
                Email = dto.Email,
                DepartmentId = dto.DepartmentId,
                DailySalary = dto.DailySalary
            }).ToList();

            try
            {
                // Thử lưu vào Database
                await _repository.AddRangeAsync(employees);
                return Ok($"Đã thêm thành công {employees.Count} nhân viên vào hệ thống!");
            }
            catch (Exception ex)
            {
                // 🎯 KIỂM TRA NẾU LỖI LÀ DO SAI ID PHÒNG BAN (FOREIGN KEY)
                if (ex.InnerException != null && ex.InnerException.Message.Contains("FOREIGN KEY"))
                {
                    return BadRequest("LỖI TỪ FILE EXCEL: Có 'ID Phòng ban' không tồn tại trên hệ thống. Vui lòng kiểm tra lại file Excel!");
                }

                // Trả về lỗi chung nếu là lỗi khác
                return StatusCode(500, "Lỗi hệ thống: " + ex.Message);
            }
        }
        // Lấy danh sách nhân viên (Ai đăng nhập cũng xem được)
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? searchTerm, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var employees = await _repository.GetAllAsync(searchTerm, page, pageSize);
            return Ok(employees);
        }

        // CHỈ ADMIN MỚI ĐƯỢC THÊM
        [HttpPost]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> Create(CreateEmployeeDTO createDto)
        {
            var employee = new Employee
            {
                FullName = createDto.FullName,
                Email = createDto.Email,
                DepartmentId = createDto.DepartmentId,
                DailySalary = createDto.DailySalary
            };

            await _repository.AddAsync(employee);
            return Ok("Thêm nhân viên thành công!");
        }

        // CHỈ ADMIN MỚI ĐƯỢC SỬA
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> Update(int id, CreateEmployeeDTO updateDto)
        {
            var employee = new Employee
            {
                Id = id,
                FullName = updateDto.FullName,
                Email = updateDto.Email,
                DepartmentId = updateDto.DepartmentId,
                DailySalary = updateDto.DailySalary
            };

            await _repository.UpdateAsync(employee);
            return NoContent();
        }

        // CHỈ ADMIN MỚI ĐƯỢC XÓA
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _repository.DeleteAsync(id);
            return NoContent();
        }


    }

}