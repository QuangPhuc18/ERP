using MiniERP.API.DTOs;
using MiniERP.API.Entities;

namespace MiniERP.API.Repositories
{
    public interface IPayrollRepository
    {
        Task SubmitTimesheetAsync(SubmitTimesheetDTO dto);

        // Chỉ để lại đúng 1 hàm này
        Task<Salary> CalculateSalaryAsync(PayrollRequestDto request);
        Task<bool> MarkAsPaidAsync(int id);
    }
}