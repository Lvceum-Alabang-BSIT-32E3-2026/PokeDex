using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResourceApi.Migrations
{
    /// <inheritdoc />
    public partial class AddGenerationToPokemon : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Generation",
                table: "Pokemons",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Generation",
                table: "Pokemons");
        }
    }
}
