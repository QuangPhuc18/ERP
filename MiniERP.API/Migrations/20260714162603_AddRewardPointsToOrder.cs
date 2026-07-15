using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniERP.API.Migrations
{
    /// <inheritdoc />
    public partial class AddRewardPointsToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DiscountFromPoints",
                table: "Orders",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "RewardPointsEarned",
                table: "Orders",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "RewardPointsUsed",
                table: "Orders",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DiscountFromPoints",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "RewardPointsEarned",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "RewardPointsUsed",
                table: "Orders");
        }
    }
}
