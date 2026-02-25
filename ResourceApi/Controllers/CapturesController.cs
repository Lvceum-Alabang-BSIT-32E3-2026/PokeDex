// ResourceApi/Controllers/CapturesController.cs
using System;
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
    [Authorize] // 🔒 All endpoints require authentication
    public class CapturesController : ControllerBase
    {
        private readonly PokemonDbContext _context;

        public CapturesController(PokemonDbContext context)
        {
            _context = context;
        }

        // POST: /api/captures/{pokemonId}
        [HttpPost("{pokemonId}")]
        public async Task<IActionResult> CapturePokemon(int pokemonId)
        {
            var pokemon = await _context.Pokemons.FindAsync(pokemonId);
            if (pokemon == null)
                return NotFound(new { message = "Pokemon not found." });

            var alreadyCaptured = await _context.Captures
                .AnyAsync(c => c.PokemonId == pokemonId);

            if (alreadyCaptured)
                return Conflict(new { message = "Pokemon already captured." });

            var capture = new Capture
            {
                PokemonId = pokemonId,
                CapturedAt = DateTime.UtcNow
            };

            _context.Captures.Add(capture);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(CapturePokemon),
                new { pokemonId },
                capture);
        }

        // DELETE: /api/captures/{pokemonId}
        [HttpDelete("{pokemonId}")]
        public async Task<IActionResult> ReleasePokemon(int pokemonId)
        {
            var capture = await _context.Captures
                .FirstOrDefaultAsync(c => c.PokemonId == pokemonId);

            if (capture == null)
                return NotFound(new { message = "Pokemon not captured." });

            _context.Captures.Remove(capture);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}