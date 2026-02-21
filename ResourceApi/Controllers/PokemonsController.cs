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
        // Task 2.1.8: Implement Get All Pokemon Endpoint #37
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pokemon>>> GetPokemons()
        {
            // Acceptance Criteria: Returns list of all pokemon with types array
            var pokemons = await _context.Pokemons
                .Include(p => p.PokemonTypes)
                .ToListAsync();

            return Ok(pokemons);
        }

        // GET: /api/pokemons/{id}
        // Task 2.1.7: Implement Get Pokemon By ID Endpoint #36
        [HttpGet("{id}")]
        public async Task<ActionResult<Pokemon>> GetPokemon(int id)
        {
            // Acceptance Criteria: Returns 404 if not found, includes all properties and types
            var pokemon = await _context.Pokemons
                .Include(p => p.PokemonTypes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pokemon == null)
            {
                return NotFound(); // Task #36: Returns 404 for non-existent ID
            }

            return Ok(pokemon);
        }

        // POST: /api/pokemons
        // Task 2.4.2 & 2.4.5: Admin only authorization
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

        // PUT: /api/pokemons/{id}
        // Task 2.4.3 & 2.4.5: Admin only authorization
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
                    var existingType = await _context.PokemonTypes
                        .FirstOrDefaultAsync(t => t.Name == typeName);
                    if (existingType != null)
                    {
                        pokemon.PokemonTypes.Add(existingType);
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
        // Task 2.4.4 & 2.4.5: Admin only authorization
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