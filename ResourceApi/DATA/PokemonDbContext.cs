using Microsoft.EntityFrameworkCore;

using ResourceApi.Models;

using ResourceApi.Models; // add this


namespace ResourceApi.Data
{
    public class PokemonDbContext : DbContext
    {
        public PokemonDbContext(DbContextOptions<PokemonDbContext> options)
            : base(options) { }

        // Updated DbSet with new Pokemon entity
        public DbSet<Pokemon> Pokemons { get; set; } = null!;
    }

    public class Pokemon
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int BaseExperience { get; set; }
    }


}
