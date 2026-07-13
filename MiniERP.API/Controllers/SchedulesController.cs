using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.API.Data;
using MiniERP.API.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MiniERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SchedulesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SchedulesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetSchedules([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var schedules = await _context.EmployeeSchedules
                .Include(s => s.Employee)
                .Where(s => s.Date >= startDate.Date && s.Date <= endDate.Date)
                .ToListAsync();

            var result = schedules.Select(s => new
            {
                s.Id,
                s.EmployeeId,
                EmployeeName = s.Employee?.FullName,
                Date = s.Date.ToString("yyyy-MM-dd"),
                StartTime = s.StartTime.ToString(@"hh\:mm"),
                EndTime = s.EndTime.ToString(@"hh\:mm"),
                s.Status,
                s.Notes
            });

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSchedule([FromBody] CreateScheduleDTO dto)
        {
            var schedule = new EmployeeSchedule
            {
                EmployeeId = dto.EmployeeId,
                Date = dto.Date.Date,
                StartTime = TimeSpan.Parse(dto.StartTime),
                EndTime = TimeSpan.Parse(dto.EndTime),
                Notes = dto.Notes,
                Status = "Scheduled"
            };

            _context.EmployeeSchedules.Add(schedule);
            await _context.SaveChangesAsync();

            return Ok(schedule);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSchedule(int id)
        {
            var schedule = await _context.EmployeeSchedules.FindAsync(id);
            if (schedule == null) return NotFound();

            _context.EmployeeSchedules.Remove(schedule);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Deleted" });
        }
    }

    public class CreateScheduleDTO
    {
        public int EmployeeId { get; set; }
        public DateTime Date { get; set; }
        public string StartTime { get; set; } = string.Empty;
        public string EndTime { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }
}
