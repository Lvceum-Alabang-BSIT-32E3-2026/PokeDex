[HttpGet("stats")]
[Authorize]
public IActionResult GetCaptureStats()
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    if (string.IsNullOrEmpty(userId))
        return Unauthorized();

    
    var capturedIds = _captureService.GetCapturedPokemonIds(userId);
    int totalCaptured = capturedIds.Count;

    
    var allPokemons = _pokemonService.GetAll();
    int totalAvailable = allPokemons.Count();

   
    double percentComplete = totalAvailable > 0
        ? Math.Round(totalCaptured * 100.0 / totalAvailable, 1)
        : 0;

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

   
    var stats = new
    {
        totalCaptured,
        totalAvailable,
        percentComplete,
        byGeneration
    };

    return Ok(stats);
}
