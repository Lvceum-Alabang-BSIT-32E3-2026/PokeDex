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
            [FromQuery] string? search = null,
            [FromQuery] string? type = null,
            [FromQuery] int? generation = null,
            [FromQuery] int offset = 0,
            [FromQuery] int limit = 20)
        {
            var query = _context.Pokemons
                .Include(p => p.PokemonTypes)
                    .ThenInclude(pt => pt.Type)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                string searchLower = search.ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(searchLower));
            }

            if (!string.IsNullOrWhiteSpace(type))
            {
                string typeLower = type.ToLower();
                query = query.Where(p => p.PokemonTypes.Any(pt => pt.Type.Name.ToLower() == typeLower));
            }

            if (generation.HasValue)
            {
                query = query.Where(p => p.Generation == generation.Value);
            }

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
            if (updateDto.Generation.HasValue) pokemon.Generation = updateDto.Generation.Value;

            if (updateDto.Types != null)
            {
                pokemon.PokemonTypes.Clear();
                foreach (var typeName in updateDto.Types)
                {
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