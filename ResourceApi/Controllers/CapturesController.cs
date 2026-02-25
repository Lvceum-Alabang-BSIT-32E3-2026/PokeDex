// ResourceApi/Controllers/CapturesController.cs
using System;
using System.Linq;
using System.Security.Claims;
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
    [Authorize]
    public class CapturesController : ControllerBase
    {
        private readonly PokemonDbContext _context;

        public CapturesController(PokemonDbContext context)
        {
            _context = context;
        }

        // GET: api/captures
        [HttpGet]
        public async Task<IActionResult> GetUserCaptures()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
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
            if (userId == null)
                return Unauthorized();

            var capture = await _context.Captures
                .Where(c => c.Id == id && c.UserId == userId)
                .FirstOrDefaultAsync();

            if (capture == null)
                return NotFound();

            return Ok(capture);
        }
    }
}