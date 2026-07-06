using MiniERP.API.DTOs;
using MiniERP.API.Entities;

namespace MiniERP.API.Repositories
{
    public interface IPayrollRepository
    {
        Task SubmitTimesheetAsync(SubmitTimesheetDTO dto);
        Task<List<TimesheetSummaryDTO>> GetTimesheetsSummaryAsync(int month, int year);
        Task<List<TimesheetLogDTO>> GetEmployeeTimesheetLogsAsync(int employeeId, int month, int year);
        
        Task<SalaryAdvance> CreateAdvanceAsync(CreateSalaryAdvanceDTO dto);
        Task<List<SalaryAdvanceDTO>> GetAdvancesAsync(int month, int year);

        Task<Salary> CalculateSalaryAsync(PayrollRequestDto request);
        Task<bool> MarkAsPaidAsync(int id);
    }
}