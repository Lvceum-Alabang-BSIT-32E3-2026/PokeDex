using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace ResourceApi.Data
{
	public class PokemonDbContextFactory : IDesignTimeDbContextFactory<PokemonDbContext>
	{
		public PokemonDbContext CreateDbContext(string[] args)
		{
			var optionsBuilder = new DbContextOptionsBuilder<PokemonDbContext>();
			optionsBuilder.UseSqlite("Data Source=pokemon.db");

			return new PokemonDbContext(optionsBuilder.Options);
		}
	}
}
