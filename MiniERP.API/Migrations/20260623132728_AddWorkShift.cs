using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniERP.API.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkShift : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "WorkShiftId",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "WorkShifts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    EmployeeName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StartTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    StartingCash = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExpectedCash = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExpectedTransfer = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExpectedDebt = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ActualCash = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Variance = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkShifts", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_WorkShiftId",
                table: "Orders",
                column: "WorkShiftId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_WorkShifts_WorkShiftId",
                table: "Orders",
                column: "WorkShiftId",
                principalTable: "WorkShifts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_WorkShifts_WorkShiftId",
                table: "Orders");

            migrationBuilder.DropTable(
                name: "WorkShifts");

            migrationBuilder.DropIndex(
                name: "IX_Orders_WorkShiftId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "WorkShiftId",
                table: "Orders");
        }
    }
}
