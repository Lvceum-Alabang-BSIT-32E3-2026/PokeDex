// ResourceApi/Controllers/CapturesController.cs
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResourceApi.Data;   // DbContext namespace
using ResourceApi.Models; // Pokemon & Capture models

namespace ResourceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CapturesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CapturesController(AppDbContext context)
        {
            _context = context;
        }

        // POST: /api/captures/{pokemonId}
        [HttpPost("{pokemonId}")]
        public async Task<IActionResult> CapturePokemon(int pokemonId)
        {
            // Check if Pokemon exists
            var pokemon = await _context.Pokemons.FindAsync(pokemonId);
            if (pokemon == null)
            {
                return NotFound(new { message = "Pokemon not found." });
            }

            // Check if Pokemon is already captured
            var alreadyCaptured = await _context.Captures
                .AnyAsync(c => c.PokemonId == pokemonId);

            if (alreadyCaptured)
            {
                return Conflict(new { message = "Pokemon already captured." });
            }

            // Create capture record
            var capture = new Capture
            {
                PokemonId = pokemonId,
                CapturedAt = DateTime.UtcNow
            };

            _context.Captures.Add(capture);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(CapturePokemon), new { pokemonId = pokemonId }, capture);
        }

        // DELETE: /api/captures/{pokemonId}
        [HttpDelete("{pokemonId}")]
        public async Task<IActionResult> ReleasePokemon(int pokemonId)
        {
            // Find the capture record by PokemonId
            var capture = await _context.Captures
                                        .FirstOrDefaultAsync(c => c.PokemonId == pokemonId);

            if (capture == null)
            {
                // If not captured, return 404
                return NotFound(new { message = "Pokemon not captured." });
            }

            // Remove capture record
            _context.Captures.Remove(capture);
            await _context.SaveChangesAsync();

            // Return 204 No Content
            return NoContent();
        }
    }
}