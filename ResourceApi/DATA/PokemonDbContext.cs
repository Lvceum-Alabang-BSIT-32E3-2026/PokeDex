using Microsoft.EntityFrameworkCore;
using ResourceApi.Models;

namespace ResourceApi.Data
{
    public class PokemonDbContext : DbContext
    {
        public PokemonDbContext(DbContextOptions<PokemonDbContext> options) : base(options)
        {
        }

        // DbSets for your tables
        public DbSet<Pokemon> Pokemons { get; set; }
        public DbSet<PokemonTypeEntity> Types { get; set; }
        public DbSet<PokemonType> PokemonTypes { get; set; } // join table

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure many-to-many relationship between Pokemon and Types
            modelBuilder.Entity<PokemonType>()
                .HasKey(pt => new { pt.PokemonId, pt.TypeId }); // composite primary key

            modelBuilder.Entity<PokemonType>()
                .HasOne(pt => pt.Pokemon)
                .WithMany(p => p.PokemonTypes) // make sure Pokemon has ICollection<PokemonType>
                .HasForeignKey(pt => pt.PokemonId);

            modelBuilder.Entity<PokemonType>()
                .HasOne(pt => pt.Type)
                .WithMany(t => t.PokemonTypes) // make sure Type has ICollection<PokemonType>
                .HasForeignKey(pt => pt.TypeId);

            // Optional: seed some example data
            // modelBuilder.Entity<Pokemon>().HasData(
            //     new Pokemon { Id = 1, Name = "Pikachu" },
            //     new Pokemon { Id = 2, Name = "Bulbasaur" }
            // );

            // modelBuilder.Entity<PokemonTypeEntity>().HasData(
            //     new PokemonTypeEntity { Id = 1, Name = "Electric" },
            //     new PokemonTypeEntity { Id = 2, Name = "Grass" }
            // );
        }
    }
}
