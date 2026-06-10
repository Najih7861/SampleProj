using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TourPackages.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddFilterIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_TourPackages_Destination",
                table: "TourPackages",
                column: "Destination");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_Status",
                table: "Bookings",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_TourPackages_Destination",
                table: "TourPackages");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_Status",
                table: "Bookings");
        }
    }
}
