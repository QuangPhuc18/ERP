using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MiniERP.API.Migrations
{
    /// <inheritdoc />
    public partial class FixUnitEncoding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Đơn vị đếm chung", "Cái" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Hộp giấy/nhựa", "Hộp" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 3,
                column: "Description",
                value: "Lon nhôm/sắt");

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 4,
                column: "Description",
                value: "Chai nhựa/thủy tinh");

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 5,
                column: "Description",
                value: "Ly/Cốc nhựa");

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Gói nilon/giấy", "Gói" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Bịch lớn", "Bịch" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Tuýp kem/sữa", "Tuýp" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Lốc 4-6 hộp/chai", "Lốc" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Vỉ trứng/thuốc", "Vỉ" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Thùng carton", "Thùng" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Két nhựa đựng chai", "Két" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Dây nhiều gói nhỏ", "Dây" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "Description", "Name" },
                values: new object[] { "ÄÆ¡n vá»‹ Ä‘áº¿m chung", "CÃ¡i" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Há»™p giáº¥y/nhá»±a", "Há»™p" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 3,
                column: "Description",
                value: "Lon nhÃ´m/sáº¯t");

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 4,
                column: "Description",
                value: "Chai nhá»±a/thá»§y tinh");

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 5,
                column: "Description",
                value: "Ly/Cá»‘c nhá»±a");

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 6,
                columns: new[] { "Description", "Name" },
                values: new object[] { "GÃ³i nilon/giáº¥y", "GÃ³i" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 7,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Bá»‹ch lá»›n", "Bá»‹ch" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 8,
                columns: new[] { "Description", "Name" },
                values: new object[] { "TuÃ½p kem/sá»¯a", "TuÃ½p" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Lá»‘c 4-6 há»™p/chai", "Lá»‘c" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "Description", "Name" },
                values: new object[] { "Vá»‰ trá»©ng/thuá»‘c", "Vá»‰" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 11,
                columns: new[] { "Description", "Name" },
                values: new object[] { "ThÃ¹ng carton", "ThÃ¹ng" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 12,
                columns: new[] { "Description", "Name" },
                values: new object[] { "KÃ©t nhá»±a Ä‘á»±ng chai", "KÃ©t" });

            migrationBuilder.UpdateData(
                table: "Units",
                keyColumn: "Id",
                keyValue: 13,
                columns: new[] { "Description", "Name" },
                values: new object[] { "DÃ¢y nhiá»u gÃ³i nhá»", "DÃ¢y" });
        }
    }
}
