using Microsoft.EntityFrameworkCore;
using ResourceApi.Models; // add this

namespace ResourceApi.Data;

public class PokemonDbContext : DbContext
{
    public PokemonDbContext(DbContextOptions<PokemonDbContext> options)
        : base(options) { }

        // Updated DbSet with new Pokemon entity
        public DbSet<Pokemon> Pokemons { get; set; } = null!;
    }
}
