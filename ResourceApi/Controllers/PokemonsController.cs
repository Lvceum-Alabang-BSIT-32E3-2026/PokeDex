using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResourceApi.Data;
using ResourceApi.DTOs;
using ResourceApi.Models;

namespace ResourceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PokemonsController : ControllerBase
    {
        private readonly PokemonDbContext _context;

        public PokemonsController(PokemonDbContext context)
        {
            _context = context;
        }

        // GET: /api/pokemons
        [HttpGet]
        public async Task<IActionResult> GetPokemons()
        {
            // Ininclude natin ang PokemonTypes para hindi empty ang list ng types
            var pokemons = await _context.Pokemons
                .Include(p => p.PokemonTypes)
                .ToListAsync();
            return Ok(pokemons);
        }

        // GET: /api/pokemons/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Pokemon>> GetPokemon(int id)
        {
            var pokemon = await _context.Pokemons
                .Include(p => p.PokemonTypes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pokemon == null) return NotFound();
            return pokemon;
        }

        // POST: /api/pokemons
        // Task 2.4.2: Implement Create Pokemon Endpoint
        [HttpPost]
[Authorize(Roles = "Admin")]
public async Task<ActionResult<Pokemon>> PostPokemon(CreatePokemonDto createDto)
{
    // 1. Map DTO to Entity
    var pokemon = new Pokemon
    {
        Name = createDto.Name,
        ImageUrl = createDto.ImageUrl,
        Generation = createDto.Generation,
        IsLegendary = createDto.IsLegendary,
        IsMythical = createDto.IsMythical,
        // Balikan natin ang stats para hindi 0 ang lumabas
        Height = 0, 
        Weight = 0,
        BaseExperience = 0
    };

    // 2. Handle Types (Mapping string names to PokemonType objects)
    if (createDto.Types != null && createDto.Types.Any())
    {
        foreach (var typeName in createDto.Types)
        {
            var existingType = await _context.PokemonTypes
                .FirstOrDefaultAsync(t => t.Name == typeName);

            if (existingType != null)
            {
                pokemon.PokemonTypes.Add(existingType);
            }
        }
    }

    _context.Pokemons.Add(pokemon);
    await _context.SaveChangesAsync();

    return CreatedAtAction(nameof(GetPokemon), new { id = pokemon.Id }, pokemon);
}
    }
}