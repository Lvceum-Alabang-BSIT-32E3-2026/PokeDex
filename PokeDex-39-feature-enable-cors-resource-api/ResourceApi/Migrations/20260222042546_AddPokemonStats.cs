using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ResourceApi.Migrations
{
    /// <inheritdoc />
    public partial class AddPokemonStats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PokemonPokemonType");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PokemonTypes",
                table: "PokemonTypes");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "PokemonTypes");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "PokemonTypes",
                newName: "IsPrimary");

            migrationBuilder.AlterColumn<bool>(
                name: "IsPrimary",
                table: "PokemonTypes",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "INTEGER")
                .OldAnnotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddColumn<int>(
                name: "PokemonId",
                table: "PokemonTypes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TypeId",
                table: "PokemonTypes",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_PokemonTypes",
                table: "PokemonTypes",
                columns: new[] { "PokemonId", "TypeId" });

            migrationBuilder.CreateTable(
                name: "PokemonTypeEntities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    Color = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PokemonTypeEntities", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PokemonTypes_TypeId",
                table: "PokemonTypes",
                column: "TypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_PokemonTypes_PokemonTypeEntities_TypeId",
                table: "PokemonTypes",
                column: "TypeId",
                principalTable: "PokemonTypeEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PokemonTypes_Pokemons_PokemonId",
                table: "PokemonTypes",
                column: "PokemonId",
                principalTable: "Pokemons",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PokemonTypes_PokemonTypeEntities_TypeId",
                table: "PokemonTypes");

            migrationBuilder.DropForeignKey(
                name: "FK_PokemonTypes_Pokemons_PokemonId",
                table: "PokemonTypes");

            migrationBuilder.DropTable(
                name: "PokemonTypeEntities");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PokemonTypes",
                table: "PokemonTypes");

            migrationBuilder.DropIndex(
                name: "IX_PokemonTypes_TypeId",
                table: "PokemonTypes");

            migrationBuilder.DropColumn(
                name: "PokemonId",
                table: "PokemonTypes");

            migrationBuilder.DropColumn(
                name: "TypeId",
                table: "PokemonTypes");

            migrationBuilder.RenameColumn(
                name: "IsPrimary",
                table: "PokemonTypes",
                newName: "Id");

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "PokemonTypes",
                type: "INTEGER",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "INTEGER")
                .Annotation("Sqlite:Autoincrement", true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "PokemonTypes",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PokemonTypes",
                table: "PokemonTypes",
                column: "Id");

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
