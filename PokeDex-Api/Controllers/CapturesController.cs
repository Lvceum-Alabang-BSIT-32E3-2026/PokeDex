using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace PokeDex_Api.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	[Authorize]
	public class CapturesController : ControllerBase
	{
		private readonly ApplicationDbContext _context;

		public CapturesController(ApplicationDbContext context)
		{
			_context = context;
		}

		[HttpGet("stats")]
		public async Task<IActionResult> GetCaptureStats()
		{
			var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

			if (string.IsNullOrEmpty(userId))
				return Unauthorized();

			var totalPokemon = await _context.Pokemons.CountAsync();

			var capturedCount = await _context.Captures
				.Where(c => c.UserId == userId)
				.Select(c => c.PokemonId)
				.Distinct()
				.CountAsync();

			var stats = new
			{
				TotalPokemon = totalPokemon,
				CapturedCount = capturedCount,
				UncapturedCount = totalPokemon - capturedCount,
				CapturePercentage = totalPokemon == 0
					? 0
					: Math.Round((double)capturedCount / totalPokemon * 100, 2)
			};

			return Ok(stats);
		}
	}
}
