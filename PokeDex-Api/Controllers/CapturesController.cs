// TODO: This controller will be implemented in future tasks when IPokemonService and ICaptureService are created
/*
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace PokeDex_Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CapturesController : ControllerBase
{
    private readonly IPokemonService _pokemonService;
    private readonly ICaptureService _captureService;

    public CapturesController(IPokemonService pokemonService, ICaptureService captureService)
    {
        _pokemonService = pokemonService;
        _captureService = captureService;
    }

    [HttpGet("stats")]
    [Authorize]
    public IActionResult GetCaptureStats()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        // ===== Task 59/60: totals =====
        var capturedIds = _captureService.GetCapturedPokemonIds(userId);
        int totalCaptured = capturedIds.Count;

        var allPokemons = _pokemonService.GetAll();
        int totalAvailable = allPokemons.Count();

        double percentComplete = totalAvailable > 0
            ? Math.Round(totalCaptured * 100.0 / totalAvailable, 1)
            : 0;

        // ===== Task 61: per-generation breakdown =====
        var byGeneration = allPokemons
            .GroupBy(p => p.Generation)
            .Select(g => new
            {
                generation = g.Key,
                total = g.Count(),
                captured = g.Count(p => capturedIds.Contains(p.Id))
            })
            .OrderBy(g => g.generation)
            .ToList();

        // ===== Task 62: per-type breakdown =====
        var byType = allPokemons
            .SelectMany(p => p.Types, (p, type) => new { Pokemon = p, Type = type }) // flatten dual-types
            .GroupBy(x => x.Type)
            .Select(g => new
            {
                type = g.Key,
                total = g.Count(),
                captured = g.Count(x => capturedIds.Contains(x.Pokemon.Id))
            })
            .OrderBy(g => g.type)
            .ToList();

  
        var stats = new
        {
            totalCaptured,
            totalAvailable,
            percentComplete,
            byGeneration,
            byType
        };

        return Ok(stats);
    }
}
*/
