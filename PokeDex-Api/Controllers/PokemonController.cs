using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class PokemonController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PokemonController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PokemonDto>>> GetPokemon()
    {
        var pokemonList = await _context.Pokemon.ToListAsync();

        var result = new List<PokemonDto>();

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var capturedIds = new List<int>();

        if (User.Identity != null && User.Identity.IsAuthenticated)
        {
            capturedIds = await _context.Captures
                .Where(c => c.UserId == userId)
                .Select(c => c.PokemonId)
                .ToListAsync();
        }

        foreach (var pokemon in pokemonList)
        {
            result.Add(new PokemonDto
            {
                Id = pokemon.Id,
                Name = pokemon.Name,
                ImageUrl = pokemon.ImageUrl,
                IsCaptured = capturedIds.Contains(pokemon.Id)
            });
        }

        return Ok(result);
    }
}
