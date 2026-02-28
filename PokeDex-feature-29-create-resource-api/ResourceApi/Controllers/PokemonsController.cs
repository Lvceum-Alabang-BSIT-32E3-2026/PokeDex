using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResourceApi.Data;

namespace ResourceApi.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class PokemonsController : ControllerBase
	{
		private readonly PokemonDbContext _context;

		public PokemonsController(PokemonDbContext context)
		{
			_context = context;
		}

		// GET: /api/pokemons
		[HttpGet]
		public async Task<IActionResult> GetPokemons()
		{
			var pokemons = await _context.Pokemons.ToListAsync();
			return Ok(pokemons);
		}
	}
}
