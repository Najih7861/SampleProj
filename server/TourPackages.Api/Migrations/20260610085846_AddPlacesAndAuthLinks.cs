using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace TourPackages.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPlacesAndAuthLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "PlaceId",
                table: "TourPackages",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Bookings",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Places",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Places", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PlaceImages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PlaceId = table.Column<int>(type: "integer", nullable: false),
                    Url = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlaceImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlaceImages_Places_PlaceId",
                        column: x => x.PlaceId,
                        principalTable: "Places",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Places",
                columns: new[] { "Id", "CreatedAt", "Description", "Name" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "A tropical paradise of palm-fringed beaches, emerald rice terraces, and clifftop temples. Bali blends laid-back surf towns with sacred mountain shrines, sunset cruises, and some of the warmest hospitality in Southeast Asia.", "Bali, Indonesia" },
                    { 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Cradled between two alpine lakes beneath the Eiger, Mönch, and Jungfrau peaks, Interlaken is the gateway to the Swiss Alps. Ride scenic cogwheel railways, hike wildflower trails, and breathe in crisp mountain air.", "Interlaken, Switzerland" },
                    { 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Japan's ancient capital, where golden pavilions, vermilion torii gates, and tranquil bamboo groves sit beside traditional tea houses. Kyoto is the heart of Japanese culture across every season.", "Kyoto, Japan" },
                    { 4, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Whitewashed villages and blue-domed churches tumble down volcanic cliffs above the deep-blue Aegean. Santorini is famed for its caldera views, black-sand beaches, and unforgettable sunsets over Oia.", "Santorini, Greece" },
                    { 5, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "Endless golden savannah and the stage for the Great Migration. The Serengeti offers close-up encounters with lions, elephants, and wildebeest herds on guided game drives across one of Africa's greatest wildernesses.", "Serengeti, Tanzania" }
                });

            migrationBuilder.UpdateData(
                table: "TourPackages",
                keyColumn: "Id",
                keyValue: 1,
                column: "PlaceId",
                value: 1);

            migrationBuilder.UpdateData(
                table: "TourPackages",
                keyColumn: "Id",
                keyValue: 2,
                column: "PlaceId",
                value: 2);

            migrationBuilder.UpdateData(
                table: "TourPackages",
                keyColumn: "Id",
                keyValue: 3,
                column: "PlaceId",
                value: 3);

            migrationBuilder.UpdateData(
                table: "TourPackages",
                keyColumn: "Id",
                keyValue: 4,
                column: "PlaceId",
                value: 4);

            migrationBuilder.UpdateData(
                table: "TourPackages",
                keyColumn: "Id",
                keyValue: 5,
                column: "PlaceId",
                value: 5);

            migrationBuilder.InsertData(
                table: "PlaceImages",
                columns: new[] { "Id", "PlaceId", "SortOrder", "Url" },
                values: new object[,]
                {
                    { 1, 1, 0, "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200" },
                    { 2, 1, 1, "https://picsum.photos/seed/bali-2/1200/700" },
                    { 3, 1, 2, "https://picsum.photos/seed/bali-3/1200/700" },
                    { 4, 1, 3, "https://picsum.photos/seed/bali-4/1200/700" },
                    { 5, 1, 4, "https://picsum.photos/seed/bali-5/1200/700" },
                    { 6, 2, 0, "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200" },
                    { 7, 2, 1, "https://picsum.photos/seed/alps-2/1200/700" },
                    { 8, 2, 2, "https://picsum.photos/seed/alps-3/1200/700" },
                    { 9, 2, 3, "https://picsum.photos/seed/alps-4/1200/700" },
                    { 10, 2, 4, "https://picsum.photos/seed/alps-5/1200/700" },
                    { 11, 3, 0, "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200" },
                    { 12, 3, 1, "https://picsum.photos/seed/kyoto-2/1200/700" },
                    { 13, 3, 2, "https://picsum.photos/seed/kyoto-3/1200/700" },
                    { 14, 3, 3, "https://picsum.photos/seed/kyoto-4/1200/700" },
                    { 15, 3, 4, "https://picsum.photos/seed/kyoto-5/1200/700" },
                    { 16, 4, 0, "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200" },
                    { 17, 4, 1, "https://picsum.photos/seed/santorini-2/1200/700" },
                    { 18, 4, 2, "https://picsum.photos/seed/santorini-3/1200/700" },
                    { 19, 4, 3, "https://picsum.photos/seed/santorini-4/1200/700" },
                    { 20, 4, 4, "https://picsum.photos/seed/santorini-5/1200/700" },
                    { 21, 5, 0, "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200" },
                    { 22, 5, 1, "https://picsum.photos/seed/serengeti-2/1200/700" },
                    { 23, 5, 2, "https://picsum.photos/seed/serengeti-3/1200/700" },
                    { 24, 5, 3, "https://picsum.photos/seed/serengeti-4/1200/700" },
                    { 25, 5, 4, "https://picsum.photos/seed/serengeti-5/1200/700" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_TourPackages_PlaceId",
                table: "TourPackages",
                column: "PlaceId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookings_UserId",
                table: "Bookings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PlaceImages_PlaceId",
                table: "PlaceImages",
                column: "PlaceId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookings_Users_UserId",
                table: "Bookings",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_TourPackages_Places_PlaceId",
                table: "TourPackages",
                column: "PlaceId",
                principalTable: "Places",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookings_Users_UserId",
                table: "Bookings");

            migrationBuilder.DropForeignKey(
                name: "FK_TourPackages_Places_PlaceId",
                table: "TourPackages");

            migrationBuilder.DropTable(
                name: "PlaceImages");

            migrationBuilder.DropTable(
                name: "Places");

            migrationBuilder.DropIndex(
                name: "IX_TourPackages_PlaceId",
                table: "TourPackages");

            migrationBuilder.DropIndex(
                name: "IX_Bookings_UserId",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "PlaceId",
                table: "TourPackages");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Bookings");
        }
    }
}
