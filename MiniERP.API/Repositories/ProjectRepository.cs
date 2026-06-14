using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.DTOs;
using MiniERP.API.Entities;

namespace MiniERP.API.Repositories
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly AppDbContext _context;

        public ProjectRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ProjectDTO>> GetAllAsync()
        {
            // Truy vấn xuyên từ bảng Project -> bảng trung gian EmployeeProjects -> bảng Employee
            return await _context.Projects
                .Select(p => new ProjectDTO
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    // Lọc qua bảng trung gian để nhặt danh sách nhân viên đút vào DTO phụ
                    Employees = p.EmployeeProjects!.Select(ep => new EmployeeInProjectDTO
                    {
                        EmployeeId = ep.Employee!.Id,
                        FullName = ep.Employee.FullName,
                        Role = ep.Role
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<ProjectDTO?> GetByIdAsync(int id)
        {
            return await _context.Projects
                .Where(p => p.Id == id)
                .Select(p => new ProjectDTO
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    Employees = p.EmployeeProjects!.Select(ep => new EmployeeInProjectDTO
                    {
                        EmployeeId = ep.Employee!.Id,
                        FullName = ep.Employee.FullName,
                        Role = ep.Role
                    }).ToList()
                })
                .FirstOrDefaultAsync();
        }

        public async Task AddAsync(Project project)
        {
            _context.Projects.Add(project);
            await _context.SaveChangesAsync();
        }

        public async Task AssignEmployeeAsync(int projectId, int employeeId, string role)
        {
            // Tạo một bản ghi mới trong bảng trung gian
            var employeeProject = new EmployeeProject
            {
                ProjectId = projectId,
                EmployeeId = employeeId,
                Role = role
            };

            _context.EmployeeProjects.Add(employeeProject);
            await _context.SaveChangesAsync();
        }
    }
}