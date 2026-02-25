using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResourceApi.Data;
using ResourceApi.Models;

namespace ResourceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Require authentication for all endpoints
    public class CapturesController : ControllerBase
    {
        private readonly PokemonDbContext _context;

        public CapturesController(PokemonDbContext context)
        {
            _context = context;
        }

        // POST: api/captures/{pokemonId}
        [HttpPost("{pokemonId}")]
        public async Task<IActionResult> CapturePokemon(int pokemonId)
        {
            // Get current user ID from JWT
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }

            // Check if the Pokemon exists
            var pokemon = await _context.Pokemons.FindAsync(pokemonId);
            if (pokemon == null)
            {
                return NotFound(new { message = "Pokemon not found." });
            }

            // Check if the user already captured this Pokemon
            var existingCapture = await _context.Captures
                .FirstOrDefaultAsync(c => c.PokemonId == pokemonId && c.UserId == userId);

            if (existingCapture != null)
            {
                return Conflict(new { message = "Pokemon already captured." });
            }

            // Create new Capture record
            var capture = new Capture
            {
                PokemonId = pokemonId,
                UserId = userId,
                CapturedAt = DateTime.UtcNow
            };

            _context.Captures.Add(capture);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(CapturePokemon), new { pokemonId = capture.PokemonId }, capture);
        }
    }
}