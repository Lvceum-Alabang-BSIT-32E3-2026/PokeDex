using System;
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
    [Authorize] // ✅ Require authentication
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
            // 1️⃣ Extract UserId from JWT
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // 2️⃣ Check if Pokemon exists
            var pokemon = await _context.Pokemons.FindAsync(pokemonId);
            if (pokemon == null)
                return NotFound(new { message = "Pokemon not found." });

            // 3️⃣ Check if current user already captured this Pokemon
            var alreadyCaptured = await _context.Captures
                .AnyAsync(c => c.PokemonId == pokemonId && c.UserId == userId);
            if (alreadyCaptured)
                return Conflict(new { message = "Pokemon already captured." });

            // 4️⃣ Create Capture record with UserId
            var capture = new Capture
            {
                PokemonId = pokemonId,
                UserId = userId,
                CapturedAt = DateTime.UtcNow
            };

            _context.Captures.Add(capture);
            await _context.SaveChangesAsync();

            // 5️⃣ Return 201 Created
            return StatusCode(201, capture);
        }
    }
}