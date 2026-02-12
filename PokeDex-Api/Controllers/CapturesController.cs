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

  
    [HttpGet("stats")]
    [Authorize]
    public IActionResult GetCaptureStats()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

     
        int totalCaptured = _captureService.GetCapturedPokemonIds(userId).Count;

        int totalAvailable = _pokemonService.GetAll().Count();

      
        double percentComplete = totalAvailable > 0
            ? Math.Round(totalCaptured * 100.0 / totalAvailable, 1)
            : 0;

        var stats = new
        {
            totalCaptured,
            totalAvailable,
            percentComplete
        };

        return Ok(stats);
    }
}
