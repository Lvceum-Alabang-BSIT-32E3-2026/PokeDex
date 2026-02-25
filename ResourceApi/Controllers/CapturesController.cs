// ResourceApi/Controllers/CapturesController.cs
using System;
using System.Linq;
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
    [Authorize] // All endpoints require authentication
    public class CapturesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CapturesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: /api/captures
        [HttpGet]
        public async Task<IActionResult> GetUserCaptures()
        {
            // Get current user's ID from JWT
            var userId = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            // Query captured Pokemon IDs for this user
            var capturedPokemonIds = await _context.Captures
                .Where(c => c.UserId == userId)
                .Select(c => c.PokemonId)
                .ToListAsync();

            return Ok(capturedPokemonIds);
        }

        // POST: /api/captures/{pokemonId}
        [HttpPost("{pokemonId}")]
        public async Task<IActionResult> CapturePokemon(int pokemonId)
        {
            var userId = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
            if (userId == null)
                return Unauthorized();

            // Check if Pokemon exists
            var pokemon = await _context.Pokemons.FindAsync(pokemonId);
            if (pokemon == null)
                return NotFound(new { message = "Pokemon not found." });

            // Check if already captured by this user
            var alreadyCaptured = await _context.Captures
                .AnyAsync(c => c.PokemonId == pokemonId && c.UserId == userId);

            if (alreadyCaptured)
                return Conflict(new { message = "Pokemon already captured." });

            var capture = new Capture
            {
                PokemonId = pokemonId,
                UserId = userId,
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
            var userId = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
            if (userId == null)
                return Unauthorized();

            var capture = await _context.Captures
                .FirstOrDefaultAsync(c => c.PokemonId == pokemonId && c.UserId == userId);

            if (capture == null)
                return NotFound(new { message = "Pokemon not captured." });

            _context.Captures.Remove(capture);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}