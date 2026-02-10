using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Security.Claims;
using System.Collections.Generic;

[ApiController]
[Route("api/[controller]")]
public class CapturesController : ControllerBase
{
    private readonly ICaptureService _captureService;
    private readonly IPokemonService _pokemonService;

    public CapturesController(ICaptureService captureService, IPokemonService pokemonService)
    {
        _captureService = captureService;
        _pokemonService = pokemonService;
    }

    // Existing Task 3.2.1 endpoint (capture stats)
    [HttpGet("stats")]
    [Authorize]
    public IActionResult GetCaptureStats()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        // Total captured by the user
        int totalCaptured = _captureService.GetCapturedPokemonIds(userId).Count;

        // Total available Pokemon in the system
        int totalAvailable = _pokemonService.GetAll().Count();

        // Percent complete (1 decimal place)
        double percentComplete = totalAvailable > 0
            ? Math.Round(totalCaptured * 100.0 / totalAvailable, 1)
            : 0;

        // Return stats
        var stats = new
        {
            totalCaptured,
            totalAvailable,
            percentComplete
        };

        return Ok(stats);
    }
}
