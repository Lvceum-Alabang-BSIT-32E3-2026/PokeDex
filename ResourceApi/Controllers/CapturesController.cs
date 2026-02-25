using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
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
        private readonly PokemonDbContext _context; // ✅ FIXED

        public CapturesController(PokemonDbContext context) // ✅ FIXED
        {
            _context = context;
        }

        // GET: api/captures
        [HttpGet]
        public async Task<IActionResult> GetUserCaptures()
        {
            // Get current user ID from JWT
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
                return Unauthorized();

            var captures = await _context.Captures
                .Where(c => c.UserId == userId)
                .Select(c => c.PokemonId)
                .ToListAsync();

            return Ok(captures);
        }
    }
}