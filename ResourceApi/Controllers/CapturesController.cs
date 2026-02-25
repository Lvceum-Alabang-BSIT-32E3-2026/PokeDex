using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResourceApi.Data;

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

            return Ok(capturedPokemonIds); // Returns an array of ints
        }
    }
}