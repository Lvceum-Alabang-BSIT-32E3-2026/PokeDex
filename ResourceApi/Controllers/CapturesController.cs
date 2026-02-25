// ResourceApi/Controllers/CapturesController.cs
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Security.Claims;
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
            // Get authenticated user's ID from JWT
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            var captures = await _context.Captures
                .Include(c => c.Pokemon)
                .Where(c => c.UserId == userId)
                .ToListAsync();

            return Ok(captures);
        }

        // POST: /api/captures/{pokemonId}
        [HttpPost("{pokemonId}")]
        public async Task<IActionResult> CapturePokemon(int pokemonId)
        {
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            // Check if Pokemon exists
            var pokemon = await _context.Pokemons.FindAsync(pokemonId);
            if (pokemon == null)
                return NotFound(new { message = "Pokemon not found." });

            // Check if this user already captured this Pokemon
            var alreadyCaptured = await _context.Captures
                .AnyAsync(c => c.PokemonId == pokemonId && c.UserId == userId);

            if (alreadyCaptured)
                return Conflict(new { message = "Pokemon already captured by this user." });

            var capture = new Capture
            {
                UserId = userId,
                PokemonId = pokemonId,
                CapturedAt = DateTime.UtcNow
            };

            _context.Captures.Add(capture);
            await _context.SaveChangesAsync();

            return StatusCode(201, capture);
        }

        // DELETE: /api/captures/{pokemonId}
        [HttpDelete("{pokemonId}")]
        public async Task<IActionResult> ReleasePokemon(int pokemonId)
        {
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized();

            // Find the capture record for this user
            var capture = await _context.Captures
                .FirstOrDefaultAsync(c => c.PokemonId == pokemonId && c.UserId == userId);

            if (capture == null)
                return NotFound(new { message = "Pokemon not captured by this user." });

            _context.Captures.Remove(capture);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}