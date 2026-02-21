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
        // Task 2.1.6: Paginated List (#35)
        [HttpGet]
        public async Task<IActionResult> GetPokemons([FromQuery] int offset = 0, [FromQuery] int limit = 20)
        {
            var query = _context.Pokemons
                .Include(p => p.PokemonTypes)
                    .ThenInclude(pt => pt.Type) // Kailangan ito para makita ang actual Type names
                .OrderBy(p => p.Id);

            var pokemons = await query.Skip(offset).Take(limit).ToListAsync();
            return Ok(pokemons);
        }

        // POST: /api/pokemons
        // Task 2.4.2: Admin only creation (#40)
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

            // FIX: Mapping string types to Join Table entities
            if (createDto.Types != null && createDto.Types.Any())
            {
                foreach (var typeName in createDto.Types)
                {
                    // Hanapin ang actual Type entity gamit ang pangalan
                    var typeEntity = await _context.Types
                        .FirstOrDefaultAsync(t => t.Name == typeName);

                    if (typeEntity != null)
                    {
                        pokemon.PokemonTypes.Add(new PokemonType
                        {
                            Pokemon = pokemon,
                            Type = typeEntity
                        });
                    }
                }
            }

            _context.Pokemons.Add(pokemon);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetPokemon), new { id = pokemon.Id }, pokemon);
        }

        // PUT: /api/pokemons/{id}
        // Task 2.4.3: Admin only update
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutPokemon(int id, UpdatePokemonDto updateDto)
        {
            var pokemon = await _context.Pokemons
                .Include(p => p.PokemonTypes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pokemon == null) return NotFound();

            // Partial Updates
            if (!string.IsNullOrEmpty(updateDto.Name)) pokemon.Name = updateDto.Name;
            if (!string.IsNullOrEmpty(updateDto.ImageUrl)) pokemon.ImageUrl = updateDto.ImageUrl;
            if (updateDto.Generation.HasValue) pokemon.Generation = updateDto.Generation.Value;

            // FIX: Correct Join Table Update logic
            if (updateDto.Types != null)
            {
                pokemon.PokemonTypes.Clear(); // Burahin ang luma
                foreach (var typeName in updateDto.Types)
                {
                    var typeEntity = await _context.Types
                        .FirstOrDefaultAsync(t => t.Name == typeName);

                    if (typeEntity != null)
                    {
                        pokemon.PokemonTypes.Add(new PokemonType { Type = typeEntity });
                    }
                }
            }

            await _context.SaveChangesAsync();
            return NoContent();
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

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeletePokemon(int id)
        {
            var pokemon = await _context.Pokemons.FindAsync(id);
            if (pokemon == null) return NotFound();

            _context.Pokemons.Remove(pokemon);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}