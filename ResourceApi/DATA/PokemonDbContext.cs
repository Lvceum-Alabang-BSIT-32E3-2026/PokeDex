using Microsoft.EntityFrameworkCore;
using ResourceApi.Models;

namespace ResourceApi.Data;

public class PokemonDbContext : DbContext
{
    public PokemonDbContext(DbContextOptions<PokemonDbContext> options)
        : base(options) { }

    public DbSet<Pokemon> Pokemons { get; set; } = null!;

    // In-update natin ito mula PokemonType -> PokemonTypeEntity 
    // para mag-match sa hininging Technical Requirements sa Task 2.1.3
    public DbSet<PokemonTypeEntity> PokemonTypes { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Task 2.1.3: Seeding initial data para sa Pokemon Types
        // Maganda itong gawin para pagka-migration mo, may laman na agad ang table.
        modelBuilder.Entity<PokemonTypeEntity>().HasData(
            new PokemonTypeEntity { Id = 1, Name = "Fire", Color = "#F08030" },
            new PokemonTypeEntity { Id = 2, Name = "Water", Color = "#6890F0" },
            new PokemonTypeEntity { Id = 3, Name = "Grass", Color = "#78C850" }
        );

        // Task 2.3.3: Seed data for Pokemon
        modelBuilder.Entity<Pokemon>().HasData(
            new Pokemon
            {
                Id = 1,
                PokedexNumber = 1,
                Name = "Bulbasaur",
                ImageUrl = "bulbasaur.png",
                Generation = 1,
                BaseExperience = 64,
                Height = 0.7m,
                Weight = 6.9m
            },
            new Pokemon
            {
                Id = 4,
                PokedexNumber = 4,
                Name = "Charmander",
                ImageUrl = "charmander.png",
                Generation = 1,
                BaseExperience = 62,
                Height = 0.6m,
                Weight = 8.5m
            }
        );
    }
}