using Microsoft.EntityFrameworkCore;
using ResourceApi.Models;

namespace ResourceApi.Data;

public class PokemonDbContext : DbContext
{
    public PokemonDbContext(DbContextOptions<PokemonDbContext> options)
        : base(options) { }

    public DbSet<Pokemon> Pokemons { get; set; } = null!;

    // Task 2.1.3: Master table para sa mga Types (Fire, Water, etc.)
    public DbSet<PokemonTypeEntity> PokemonTypes { get; set; } = null!;

    // Task 2.1.4: Join table para sa relationship ng Pokemon at Types
    public DbSet<PokemonType> PokemonTypeJoins { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // --- MANY-TO-MANY CONFIGURATION (Task 2.1.4) ---

        // 1. I-set ang Composite Primary Key para sa Join Table
        modelBuilder.Entity<PokemonType>()
            .HasKey(pt => new { pt.PokemonId, pt.TypeId });

        // 2. I-configure ang relationship sa Pokemon side
        modelBuilder.Entity<PokemonType>()
            .HasOne(pt => pt.Pokemon)
            .WithMany(p => p.PokemonTypes) // Dapat may ICollection<PokemonType> sa Pokemon model
            .HasForeignKey(pt => pt.PokemonId);

        // 3. I-configure ang relationship sa Type side
        modelBuilder.Entity<PokemonType>()
            .HasOne(pt => pt.Type)
            .WithMany()
            .HasForeignKey(pt => pt.TypeId);

        // --- SEED DATA ---
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