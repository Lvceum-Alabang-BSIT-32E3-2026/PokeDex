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

		// GET: /api/pokemons?generation=1&type=fire
		[HttpGet]
		public async Task<IActionResult> GetPokemons([FromQuery] int? generation, [FromQuery] string? type)
		{
			var query = _context.Pokemons.AsQueryable();

			if (generation.HasValue)
				query = query.Where(p => p.Generation == generation.Value);

			if (!string.IsNullOrEmpty(type))
				query = query.Where(p => p.Type.ToLower() == type.ToLower());

			var pokemons = await query.ToListAsync();
			return Ok(pokemons);
		}
	}
}
