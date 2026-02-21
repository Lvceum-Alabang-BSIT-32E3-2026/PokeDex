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
        public async Task<ActionResult<IEnumerable<Pokemon>>> GetPokemons([FromQuery] int offset = 0, [FromQuery] int limit = 20)
        {
            // Ginamitan ng ThenInclude para makuha ang Name at Color mula sa PokemonTypeEntity
            var query = _context.Pokemons
                .Include(p => p.PokemonTypes)
                    .ThenInclude(pt => pt.Type)
                .OrderBy(p => p.Id);

            var pokemons = await query
                .Skip(offset)
                .Take(limit)
                .ToListAsync();

            return Ok(pokemons);
        }

        // GET: /api/pokemons/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Pokemon>> GetPokemon(int id)
        {
            var pokemon = await _context.Pokemons
                .Include(p => p.PokemonTypes)
                    .ThenInclude(pt => pt.Type)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pokemon == null)
            {
                return NotFound();
            }

            return Ok(pokemon);
        }

        // POST: /api/pokemons
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
                Height = 0,
                Weight = 0,
                BaseExperience = 0
            };

            if (createDto.Types != null && createDto.Types.Any())
            {
                foreach (var typeName in createDto.Types)
                {
                    // FIXED: Sa _context.Types tayo maghahanap dahil ito ang may 'Name' property
                    var existingTypeEntity = await _context.Types
                        .FirstOrDefaultAsync(t => t.Name == typeName);

                    if (existingTypeEntity != null)
                    {
                        // FIXED: Gagawa ng bagong PokemonType join record
                        pokemon.PokemonTypes.Add(new PokemonType
                        {
                            Type = existingTypeEntity,
                            IsPrimary = pokemon.PokemonTypes.Count == 0
                        });
                    }
                }
            }

            _context.Pokemons.Add(pokemon);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPokemon), new { id = pokemon.Id }, pokemon);
        }

        // PUT: /api/pokemons/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutPokemon(int id, UpdatePokemonDto updateDto)
        {
            var pokemon = await _context.Pokemons
                .Include(p => p.PokemonTypes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pokemon == null) return NotFound();

            if (!string.IsNullOrEmpty(updateDto.Name)) pokemon.Name = updateDto.Name;
            if (!string.IsNullOrEmpty(updateDto.ImageUrl)) pokemon.ImageUrl = updateDto.ImageUrl;
            if (updateDto.Generation.HasValue) pokemon.Generation = updateDto.Generation.Value;
            if (updateDto.IsLegendary.HasValue) pokemon.IsLegendary = updateDto.IsLegendary.Value;
            if (updateDto.IsMythical.HasValue) pokemon.IsMythical = updateDto.IsMythical.Value;

            if (updateDto.Types != null)
            {
                pokemon.PokemonTypes.Clear();
                foreach (var typeName in updateDto.Types)
                {
                    // FIXED: Sa _context.Types tayo maghahanap
                    var existingTypeEntity = await _context.Types
                        .FirstOrDefaultAsync(t => t.Name == typeName);

                    if (existingTypeEntity != null)
                    {
                        pokemon.PokemonTypes.Add(new PokemonType
                        {
                            Type = existingTypeEntity
                        });
                    }
                }
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Pokemons.Any(e => e.Id == id)) return NotFound();
                else throw;
            }

            return NoContent();
        }

        // DELETE: /api/pokemons/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePokemon(int id)
        {
            var pokemon = await _context.Pokemons.FindAsync(id);

            if (pokemon == null)
            {
                return NotFound();
            }

            _context.Pokemons.Remove(pokemon);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}