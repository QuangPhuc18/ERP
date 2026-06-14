using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MiniERP.API.DTOs;
using MiniERP.API.Entities;
using MiniERP.API.Repositories;

namespace MiniERP.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Ổ khóa bảo mật: Vẫn bắt buộc quẹt thẻ Token mới được vào
    public class ProjectsController : ControllerBase
    {
        private readonly IProjectRepository _repository;

        public ProjectsController(IProjectRepository repository)
        {
            _repository = repository;
        }

        // Lấy danh sách tất cả dự án
        // GET: api/projects
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var projects = await _repository.GetAllAsync();
            return Ok(projects);
        }

        // Tạo dự án mới
        // POST: api/projects
        [HttpPost]
        public async Task<IActionResult> Create(CreateProjectDTO createDto)
        {
            var project = new Project
            {
                Name = createDto.Name,
                Description = createDto.Description,
                StartDate = createDto.StartDate,
                EndDate = createDto.EndDate
            };

            await _repository.AddAsync(project);
            return Ok("Tạo dự án thành công!");
        }

        // Phân công nhân viên vào dự án
        // POST: api/projects/{id}/assign
        [HttpPost("{id}/assign")]
        public async Task<IActionResult> AssignEmployee(int id, [FromBody] AssignEmployeeDTO assignDto)
        {
            // Kiểm tra an toàn: ID trên đường dẫn phải khớp với ProjectId gửi trong JSON
            if (id != assignDto.ProjectId)
            {
                return BadRequest("ID dự án không hợp lệ!");
            }

            await _repository.AssignEmployeeAsync(assignDto.ProjectId, assignDto.EmployeeId, assignDto.Role);
            return Ok("Phân công nhân viên thành công!");
        }
    }
}