// ResourceApi/Controllers/CapturesController.cs
using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResourceApi.Data; // Your DbContext namespace
using ResourceApi.Models; // Your Pokemon & Capture models

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
    }
}