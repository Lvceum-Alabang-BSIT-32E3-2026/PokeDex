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
    [Authorize]
    public class CapturesController : ControllerBase
    {
        private readonly PokemonDbContext _context;

        public CapturesController(PokemonDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CaptureDto>>> GetCaptures()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var captures = await _context.Captures
                .Include(c => c.Pokemon)
                .Where(c => c.UserId == userId)
                .Select(c => new CaptureDto
                {
                    Id = c.Id,
                    PokemonId = c.PokemonId,
                    PokemonName = c.Pokemon.Name,
                    PokemonImageUrl = c.Pokemon.ImageUrl,
                    CapturedAt = c.CapturedAt
                })
                .ToListAsync();

            return Ok(captures);
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
