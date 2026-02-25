using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ResourceApi.Data;
using ResourceApi.Models;

namespace ResourceApi.Controllers
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

        // GET: api/captures
        // Returns list of Pokemon IDs captured by current user
        [HttpGet]
        public async Task<IActionResult> GetAllCaptures()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var capturedPokemonIds = await _context.Captures
                .Where(c => c.UserId == userId)
                .Select(c => c.PokemonId)
                .ToListAsync();

            return Ok(capturedPokemonIds);
        }

        // GET: api/captures/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCaptureById(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var capture = await _context.Captures
                .Where(c => c.Id == id && c.UserId == userId)
                .FirstOrDefaultAsync();

            if (capture == null)
                return NotFound();

            return Ok(capture);
        }

        // POST: api/captures
        [HttpPost]
        public async Task<IActionResult> CreateCapture([FromBody] int pokemonId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            // Prevent duplicate captures
            var exists = await _context.Captures
                .AnyAsync(c => c.UserId == userId && c.PokemonId == pokemonId);

            if (exists)
                return BadRequest("Pokemon already captured.");

            var capture = new Capture
            {
                UserId = userId,
                PokemonId = pokemonId
            };

            _context.Captures.Add(capture);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Pokemon captured successfully." });
        }

        // DELETE: api/captures/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCapture(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var capture = await _context.Captures
                .Where(c => c.Id == id && c.UserId == userId)
                .FirstOrDefaultAsync();

            if (capture == null)
                return NotFound();

            _context.Captures.Remove(capture);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Capture deleted successfully." });
        }
    }
}