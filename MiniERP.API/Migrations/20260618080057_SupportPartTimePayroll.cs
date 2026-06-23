using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniERP.API.Migrations
{
    /// <inheritdoc />
    public partial class SupportPartTimePayroll : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                table: "Timesheets");

            migrationBuilder.AddColumn<DateTime>(
                name: "CheckInTime",
                table: "Timesheets",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CheckOutTime",
                table: "Timesheets",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TotalHours",
                table: "Timesheets",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "TotalHours",
                table: "Salaries",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "EmployeeType",
                table: "Employees",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "HourlyRate",
                table: "Employees",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CheckInTime",
                table: "Timesheets");

            migrationBuilder.DropColumn(
                name: "CheckOutTime",
                table: "Timesheets");

            migrationBuilder.DropColumn(
                name: "TotalHours",
                table: "Timesheets");

            migrationBuilder.DropColumn(
                name: "TotalHours",
                table: "Salaries");

            migrationBuilder.DropColumn(
                name: "EmployeeType",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "HourlyRate",
                table: "Employees");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Timesheets",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
