using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.DTOs;
using MiniERP.API.Entities;

namespace MiniERP.API.Repositories
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly AppDbContext _context;

        public EmployeeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EmployeeDTO>> GetAllAsync(string? searchTerm, int page, int pageSize)
        {
            var query = _context.Employees
                .Include(e => e.Department)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(e => e.FullName.Contains(searchTerm) || e.Email.Contains(searchTerm));
            }

            var employees = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(e => new EmployeeDTO
                {
                    Id = e.Id,
                    FullName = e.FullName,
                    Email = e.Email,
                    DailySalary = e.DailySalary,
                    DepartmentName = e.Department != null ? e.Department.Name : "Chưa phân phòng",
                    // 🎯 Dòng quan trọng để Frontend bắt được ID phòng ban
                    DepartmentId = e.DepartmentId.ToString()
                })
                .ToListAsync();

            return employees;
        }

        public async Task<Employee?> GetByIdAsync(int id)
        {
            return await _context.Employees.FindAsync(id);
        }

        public async Task AddAsync(Employee employee)
        {
            await _context.Employees.AddAsync(employee);
            await _context.SaveChangesAsync();
        }

        public async Task AddRangeAsync(IEnumerable<Employee> employees)
        {
            await _context.Employees.AddRangeAsync(employees);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Employee employee)
        {
            _context.Employees.Update(employee);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee != null)
            {
                _context.Employees.Remove(employee);
                await _context.SaveChangesAsync();
            }
        }
    }
}