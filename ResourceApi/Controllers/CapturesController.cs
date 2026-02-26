using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResourceApi.Data;
using ResourceApi.DTOs;
using ResourceApi.Models;
using System.Security.Claims;

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
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var pokemon = await _context.Pokemons.FindAsync(pokemonId);
            if (pokemon == null) return NotFound(new { message = "Pokemon not found." });

            var existingCapture = await _context.Captures
                .FirstOrDefaultAsync(c => c.PokemonId == pokemonId && c.UserId == userId);
            if (existingCapture != null) return Conflict(new { message = "Pokemon already captured." });

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

        // DELETE: api/captures/{pokemonId}
        [HttpDelete("{pokemonId}")]
        public async Task<IActionResult> ReleasePokemon(int pokemonId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            // Find the capture record for this user and Pokemon
            var capture = await _context.Captures
                .FirstOrDefaultAsync(c => c.PokemonId == pokemonId && c.UserId == userId);

            if (capture == null) return NotFound(new { message = "Pokemon not captured." });

            _context.Captures.Remove(capture);
            await _context.SaveChangesAsync();

            return NoContent(); // 204 No Content on success
        }

        [HttpPost("{pokemonId}")]
        public async Task<ActionResult<CaptureDto>> CapturePokemon(int pokemonId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var pokemon = await _context.Pokemons.FindAsync(pokemonId);
            if (pokemon == null) return NotFound("Pokemon not found.");

            // Check if already captured
            var existing = await _context.Captures
                .FirstOrDefaultAsync(c => c.UserId == userId && c.PokemonId == pokemonId);
            
            if (existing != null) return BadRequest("Pokemon already captured.");

            var capture = new Capture
            {
                PokemonId = pokemonId,
                UserId = userId,
                CapturedAt = DateTime.UtcNow
            };

            _context.Captures.Add(capture);
            await _context.SaveChangesAsync();

            return Ok(new CaptureDto
            {
                Id = capture.Id,
                PokemonId = capture.PokemonId,
                PokemonName = pokemon.Name,
                PokemonImageUrl = pokemon.ImageUrl,
                CapturedAt = capture.CapturedAt
            });
        }

        [HttpDelete("{pokemonId}")]
        public async Task<IActionResult> ReleasePokemon(int pokemonId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var capture = await _context.Captures
                .FirstOrDefaultAsync(c => c.UserId == userId && c.PokemonId == pokemonId);

            if (capture == null) return NotFound("Capture not found.");

            _context.Captures.Remove(capture);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
