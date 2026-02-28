using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ResourceApi.Migrations
{
    /// <inheritdoc />
    public partial class CreatePokemonTypeTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PokemonPokemonType");

            migrationBuilder.AddColumn<string>(
                name: "Color",
                table: "PokemonTypes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PokemonId",
                table: "PokemonTypes",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.InsertData(
                table: "PokemonTypes",
                columns: new[] { "Id", "Color", "Name", "PokemonId" },
                values: new object[,]
                {
                    { 1, "#F08030", "Fire", null },
                    { 2, "#6890F0", "Water", null },
                    { 3, "#78C850", "Grass", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_PokemonTypes_PokemonId",
                table: "PokemonTypes",
                column: "PokemonId");

            migrationBuilder.AddForeignKey(
                name: "FK_PokemonTypes_Pokemons_PokemonId",
                table: "PokemonTypes",
                column: "PokemonId",
                principalTable: "Pokemons",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PokemonTypes_Pokemons_PokemonId",
                table: "PokemonTypes");

            migrationBuilder.DropIndex(
                name: "IX_PokemonTypes_PokemonId",
                table: "PokemonTypes");

            migrationBuilder.DeleteData(
                table: "PokemonTypes",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "PokemonTypes",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "PokemonTypes",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DropColumn(
                name: "Color",
                table: "PokemonTypes");

            migrationBuilder.DropColumn(
                name: "PokemonId",
                table: "PokemonTypes");

            migrationBuilder.CreateTable(
                name: "PokemonPokemonType",
                columns: table => new
                {
                    PokemonTypesId = table.Column<int>(type: "INTEGER", nullable: false),
                    PokemonsId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PokemonPokemonType", x => new { x.PokemonTypesId, x.PokemonsId });
                    table.ForeignKey(
                        name: "FK_PokemonPokemonType_PokemonTypes_PokemonTypesId",
                        column: x => x.PokemonTypesId,
                        principalTable: "PokemonTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PokemonPokemonType_Pokemons_PokemonsId",
                        column: x => x.PokemonsId,
                        principalTable: "Pokemons",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PokemonPokemonType_PokemonsId",
                table: "PokemonPokemonType",
                column: "PokemonsId");
        }
    }
}
