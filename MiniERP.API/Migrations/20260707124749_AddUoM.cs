using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace MiniERP.API.Migrations
{
    /// <inheritdoc />
    public partial class AddUoM : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UnitId",
                table: "Products",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Units",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Units", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductUoMs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    UnitId = table.Column<int>(type: "int", nullable: false),
                    ConversionFactor = table.Column<int>(type: "int", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductUoMs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductUoMs_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProductUoMs_Units_UnitId",
                        column: x => x.UnitId,
                        principalTable: "Units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "Units",
                columns: new[] { "Id", "Description", "Name" },
                values: new object[,]
                {
                    { 1, "Đơn vị đếm chung", "Cái" },
                    { 2, "Hộp giấy/nhựa", "Hộp" },
                    { 3, "Lon nhôm/sắt", "Lon" },
                    { 4, "Chai nhựa/thủy tinh", "Chai" },
                    { 5, "Ly/Cốc nhựa", "Ly" },
                    { 6, "Gói nilon/giấy", "Gói" },
                    { 7, "Bịch lớn", "Bịch" },
                    { 8, "Tuýp kem/sữa", "Tuýp" },
                    { 9, "Lốc 4-6 hộp/chai", "Lốc" },
                    { 10, "Vỉ trứng/thuốc", "Vỉ" },
                    { 11, "Thùng carton", "Thùng" },
                    { 12, "Két nhựa đựng chai", "Két" },
                    { 13, "Dây nhiều gói nhỏ", "Dây" },
                    { 14, "Kilogram", "Kg" },
                    { 15, "Gram", "Gram" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Products_UnitId",
                table: "Products",
                column: "UnitId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductUoMs_ProductId",
                table: "ProductUoMs",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductUoMs_UnitId",
                table: "ProductUoMs",
                column: "UnitId");

            migrationBuilder.AddForeignKey(
                name: "FK_Products_Units_UnitId",
                table: "Products",
                column: "UnitId",
                principalTable: "Units",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Products_Units_UnitId",
                table: "Products");

            migrationBuilder.DropTable(
                name: "ProductUoMs");

            migrationBuilder.DropTable(
                name: "Units");

            migrationBuilder.DropIndex(
                name: "IX_Products_UnitId",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "UnitId",
                table: "Products");
        }
    }
}
