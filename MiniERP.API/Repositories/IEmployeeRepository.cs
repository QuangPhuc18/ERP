using MiniERP.API.DTOs;
using MiniERP.API.Entities;

namespace MiniERP.API.Repositories
{
    public interface IEmployeeRepository
    {
        Task<IEnumerable<EmployeeDTO>> GetAllAsync(string? searchTerm, int page, int pageSize);
        Task<Employee?> GetByIdAsync(int id);
        Task AddAsync(Employee employee);
        Task AddRangeAsync(IEnumerable<Employee> employees);
        Task UpdateAsync(Employee employee);
        Task DeleteAsync(int id);
    }
}