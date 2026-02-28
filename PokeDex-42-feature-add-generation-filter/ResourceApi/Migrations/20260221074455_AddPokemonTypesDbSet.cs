using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ResourceApi.Migrations
{
    /// <inheritdoc />
    public partial class AddPokemonTypesDbSet : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Type",
                table: "Pokemons",
                newName: "Weight");

            migrationBuilder.AddColumn<int>(
                name: "Generation",
                table: "Pokemons",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "Height",
                table: "Pokemons",
                type: "TEXT",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Pokemons",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "IsLegendary",
                table: "Pokemons",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsMythical",
                table: "Pokemons",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "PokedexNumber",
                table: "Pokemons",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "PokemonTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PokemonTypes", x => x.Id);
                });

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

            migrationBuilder.InsertData(
                table: "Pokemons",
                columns: new[] { "Id", "BaseExperience", "Generation", "Height", "ImageUrl", "IsLegendary", "IsMythical", "Name", "PokedexNumber", "Weight" },
                values: new object[,]
                {
                    { 1, 64, 1, 0.7m, "bulbasaur.png", false, false, "Bulbasaur", 1, 6.9m },
                    { 4, 62, 1, 0.6m, "charmander.png", false, false, "Charmander", 4, 8.5m }
                });

            migrationBuilder.CreateIndex(
                name: "IX_PokemonPokemonType_PokemonsId",
                table: "PokemonPokemonType",
                column: "PokemonsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PokemonPokemonType");

            migrationBuilder.DropTable(
                name: "PokemonTypes");

            migrationBuilder.DeleteData(
                table: "Pokemons",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Pokemons",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DropColumn(
                name: "Generation",
                table: "Pokemons");

            migrationBuilder.DropColumn(
                name: "Height",
                table: "Pokemons");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Pokemons");

            migrationBuilder.DropColumn(
                name: "IsLegendary",
                table: "Pokemons");

            migrationBuilder.DropColumn(
                name: "IsMythical",
                table: "Pokemons");

            migrationBuilder.DropColumn(
                name: "PokedexNumber",
                table: "Pokemons");

            migrationBuilder.RenameColumn(
                name: "Weight",
                table: "Pokemons",
                newName: "Type");
        }
    }
}
