using Microsoft.EntityFrameworkCore;
using ResourceApi.Models;

namespace ResourceApi.Data
{
    public class PokemonDbContext : DbContext
    {
        public PokemonDbContext(DbContextOptions<PokemonDbContext> options)
            : base(options) { }

        public DbSet<Pokemon> Pokemons { get; set; } = null!;
        public DbSet<PokemonTypeEntity> PokemonTypeEntities { get; set; } = null!;
        public DbSet<PokemonType> PokemonTypes { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Many-to-Many Relationship
            modelBuilder.Entity<PokemonType>()
                .HasKey(pt => new { pt.PokemonId, pt.TypeId });

            modelBuilder.Entity<PokemonType>()
                .HasOne(pt => pt.Pokemon)
                .WithMany(p => p.PokemonTypes)
                .HasForeignKey(pt => pt.PokemonId);

            modelBuilder.Entity<PokemonType>()
                .HasOne(pt => pt.Type)
                .WithMany(te => te.PokemonTypes)
                .HasForeignKey(pt => pt.TypeId);
        }
        // Siguraduhin na wala nang ibang "public class Pokemon" dito sa ibaba!
    }
}