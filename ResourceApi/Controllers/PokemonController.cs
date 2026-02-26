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
    public class PokemonController : ControllerBase
    {
        private readonly PokemonDbContext _context;

        public PokemonController(PokemonDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<PokemonListDto>> GetPokemons(
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

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(p => p.PokedexNumber)
                .Skip(offset)
                .Take(limit)
                .Select(p => new PokemonDto
                {
                    Id = p.Id,
                    PokedexNumber = p.PokedexNumber,
                    Name = p.Name,
                    ImageUrl = p.ImageUrl,
                    Generation = p.Generation,
                    IsLegendary = p.IsLegendary,
                    IsMythical = p.IsMythical,
                    Types = p.PokemonTypes.Select(pt => pt.Type.Name).ToList()
                })
                .ToListAsync();

            return Ok(new PokemonListDto
            {
                Items = items,
                TotalCount = totalCount,
                Page = (offset / limit) + 1,
                PageSize = limit
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PokemonDto>> GetPokemon(int id)
        {
            var pokemon = await _context.Pokemons
                .Include(p => p.PokemonTypes)
                    .ThenInclude(pt => pt.Type)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pokemon == null) return NotFound();

            return Ok(new PokemonDto
            {
                Id = pokemon.Id,
                PokedexNumber = pokemon.PokedexNumber,
                Name = pokemon.Name,
                ImageUrl = pokemon.ImageUrl,
                Generation = pokemon.Generation,
                IsLegendary = pokemon.IsLegendary,
                IsMythical = pokemon.IsMythical,
                Types = pokemon.PokemonTypes.Select(pt => pt.Type.Name).ToList()
            });
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
                    // FIX: Query the Master List (PokemonTypeEntities) to find the name
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
                    // FIX: Query the Master List (PokemonTypeEntities) to find the name
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