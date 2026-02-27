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
        // Siguraduhin na wala nang ibang "public class Pokemon" dito sa ibaba!
    }
}