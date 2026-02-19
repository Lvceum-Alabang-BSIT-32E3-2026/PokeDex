using Microsoft.EntityFrameworkCore;
<<<<<<< HEAD
using ResourceApi.Models;
=======
using ResourceApi.Models; // add this
>>>>>>> dev-backend

namespace ResourceApi.Data
{
    public class PokemonDbContext : DbContext
    {
        public PokemonDbContext(DbContextOptions<PokemonDbContext> options)
            : base(options) { }

        // Updated DbSet with new Pokemon entity
        public DbSet<Pokemon> Pokemons { get; set; } = null!;
    }
<<<<<<< HEAD
    public class Pokemon
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int BaseExperience { get; set; }
    }
=======
>>>>>>> dev-backend
}
