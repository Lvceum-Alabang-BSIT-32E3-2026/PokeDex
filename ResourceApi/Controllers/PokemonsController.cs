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

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pokemon>>> GetPokemons(
            [FromQuery] string? search = null, // Task 2.2.1
            [FromQuery] string? type = null,   // Task 2.2.2
            [FromQuery] int offset = 0,
            [FromQuery] int limit = 20)
        {
            // Initial query with Many-to-Many includes
            var query = _context.Pokemons
                .Include(p => p.PokemonTypes)
                    .ThenInclude(pt => pt.Type)
                .AsQueryable();

            // Task 2.2.1: Search by Name (Case-insensitive, Partial Match)
            if (!string.IsNullOrWhiteSpace(search))
            {
                string searchLower = search.ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(searchLower));
            }

            // Task 2.2.2: Filter by Type Name (Case-insensitive)
            if (!string.IsNullOrWhiteSpace(type))
            {
                string typeLower = type.ToLower();
                // Filters Pokemon that have at least one type matching the query
                query = query.Where(p => p.PokemonTypes.Any(pt => pt.Type.Name.ToLower() == typeLower));
            }

            // Order by PokedexNumber as per standard sorting
            query = query.OrderBy(p => p.PokedexNumber);

            var pokemons = await query
                .Skip(offset)
                .Take(limit)
                .ToListAsync();

            return Ok(pokemons);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Pokemon>> GetPokemon(int id)
        {
            var pokemon = await _context.Pokemons
                .Include(p => p.PokemonTypes)
                    .ThenInclude(pt => pt.Type)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pokemon == null) return NotFound();

            return Ok(pokemon);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Pokemon>> PostPokemon(CreatePokemonDto createDto)
        {
            var pokemon = new Pokemon
            {
                Name = createDto.Name,
                ImageUrl = createDto.ImageUrl,
                Generation = createDto.Generation,
                IsLegendary = createDto.IsLegendary,
                IsMythical = createDto.IsMythical,
                PokemonTypes = new List<PokemonType>()
            };

            if (createDto.Types != null)
            {
                foreach (var typeName in createDto.Types)
                {
                    // Search in the Master List (PokemonTypeEntities)
                    var existingType = await _context.PokemonTypeEntities
                        .FirstOrDefaultAsync(t => t.Name == typeName);

                    if (existingType != null)
                    {
                        pokemon.PokemonTypes.Add(new PokemonType
                        {
                            Pokemon = pokemon,
                            Type = existingType,
                            IsPrimary = pokemon.PokemonTypes.Count == 0
                        });
                    }
                }
            }

            _context.Pokemons.Add(pokemon);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPokemon), new { id = pokemon.Id }, pokemon);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutPokemon(int id, UpdatePokemonDto updateDto)
        {
            var pokemon = await _context.Pokemons
                .Include(p => p.PokemonTypes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pokemon == null) return NotFound();

            if (!string.IsNullOrEmpty(updateDto.Name)) pokemon.Name = updateDto.Name;

            if (updateDto.Types != null)
            {
                pokemon.PokemonTypes.Clear();
                foreach (var typeName in updateDto.Types)
                {
                    // Find correct Type from Master List
                    var existingType = await _context.PokemonTypeEntities
                        .FirstOrDefaultAsync(t => t.Name == typeName);

                    if (existingType != null)
                    {
                        pokemon.PokemonTypes.Add(new PokemonType
                        {
                            PokemonId = pokemon.Id,
                            TypeId = existingType.Id,
                            IsPrimary = pokemon.PokemonTypes.Count == 0
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}