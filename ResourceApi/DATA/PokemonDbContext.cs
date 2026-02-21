using Microsoft.EntityFrameworkCore;
using ResourceApi.Models;

namespace ResourceApi.Data;

public class PokemonDbContext : DbContext
{
    public PokemonDbContext(DbContextOptions<PokemonDbContext> options)
        : base(options) { }

    public DbSet<Pokemon> Pokemons { get; set; } = null!;

    // Siguraduhing may DbSet para sa Types
    public DbSet<PokemonTypeEntity> Types { get; set; } = null!;

    // Idagdag ito para ma-access ng Controller ang PokemonTypes table
    public DbSet<PokemonType> PokemonTypes { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- Task 2.1.4: Configure Many-to-Many Join Table ---

        // 1. I-set ang Composite Primary Key (PokemonId + TypeId)
        modelBuilder.Entity<PokemonType>()
            .HasKey(pt => new { pt.PokemonId, pt.TypeId });

        // 2. Relationship para sa Pokemon side
        modelBuilder.Entity<PokemonType>()
            .HasOne(pt => pt.Pokemon)
            .WithMany(p => p.PokemonTypes)
            .HasForeignKey(pt => pt.PokemonId);

        // 3. Relationship para sa Type side
        modelBuilder.Entity<PokemonType>()
            .HasOne(pt => pt.Type)
            .WithMany(t => t.PokemonTypes)
            .HasForeignKey(pt => pt.TypeId);

        // --- Task 2.3.3: Seed data for Pokemon ---
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