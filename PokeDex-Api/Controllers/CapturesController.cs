using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokeDex_Api.Data;
using System.Security.Claims;

namespace PokeDex_Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CapturesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CapturesController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// GET /api/captures - Returns list of captured Pokemon IDs for the current user
    /// </summary>
    /// <returns>Array of Pokemon IDs that the user has captured</returns>
    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetUserCaptures()
    {
        // Extract user ID from JWT claims
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // Validate user ID exists
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User ID not found in token" });
        }

        // Query captures filtered by current user and return only Pokemon IDs
        var capturedPokemonIds = await _context.Captures
            .Where(c => c.UserId == userId)
            .Select(c => c.PokemonId)
            .ToListAsync();

        return Ok(capturedPokemonIds);
    }
}
