using System.Text.Json.Serialization;

namespace MiniERP.API.DTOs
{
    public class PayrollRequestDto
    {
        [JsonPropertyName("employeeId")]
        public int EmployeeId { get; set; }

        [JsonPropertyName("workDays")]
        public double WorkDays { get; set; }

        [JsonPropertyName("month")]
        public int Month { get; set; }

        [JsonPropertyName("year")]
        public int Year { get; set; }
    }
}