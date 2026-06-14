using MiniERP.API.Entities;

namespace MiniERP.API.Repositories
{
    public interface IDepartmentRepository
    {
        // Chỉ để các hàm quản lý Department
        Task<IEnumerable<Department>> GetAllAsync();
        Task<Department?> GetByIdAsync(int id);
        Task AddAsync(Department department);
        Task UpdateAsync(Department department);
        Task DeleteAsync(int id);
    }
}