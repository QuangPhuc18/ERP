using MiniERP.API.DTOs;
using MiniERP.API.Entities;

namespace MiniERP.API.Repositories
{
    public interface IProjectRepository
    {
        Task<IEnumerable<ProjectDTO>> GetAllAsync();
        Task<ProjectDTO?> GetByIdAsync(int id);
        Task AddAsync(Project project);

        // Hàm xử lý bảng trung gian (Phân công)
        Task AssignEmployeeAsync(int projectId, int employeeId, string role);
    }
}