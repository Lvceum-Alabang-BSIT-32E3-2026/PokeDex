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
        // Task 2.1.6: Paginated List (#35) & Task 2.4.5: Public Access
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pokemon>>> GetPokemons([FromQuery] int offset = 0, [FromQuery] int limit = 20)
        {
            // Requirement: Order by Id (PokedexNumber) and Include types
            var query = _context.Pokemons
                .Include(p => p.PokemonTypes)
                .OrderBy(p => p.Id);

            var pokemons = await query
                .Skip(offset)
                .Take(limit)
                .ToListAsync();

            return Ok(pokemons);
        }

        // GET: /api/pokemons/{id}
        // Task 2.1.7: Get By ID (#36) & Task 2.4.5: Public Access
        [HttpGet("{id}")]
        public async Task<ActionResult<Pokemon>> GetPokemon(int id)
        {
            var pokemon = await _context.Pokemons
                .Include(p => p.PokemonTypes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pokemon == null) return NotFound(); // Return 404 if missing

            return Ok(pokemon);
        }

        // POST: /api/pokemons
        // Task 2.4.2: Implement Create Pokemon Endpoint (#40)
        [HttpPost]
        [Authorize(Roles = "Admin")] // Requirement: Admin only authorization
        public async Task<ActionResult<Pokemon>> PostPokemon(CreatePokemonDto createDto)
        {
            // Acceptance Criteria: Create new pokemon with properties and types
            var pokemon = new Pokemon
            {
                Name = createDto.Name,
                ImageUrl = createDto.ImageUrl,
                Generation = createDto.Generation,
                IsLegendary = createDto.IsLegendary,
                IsMythical = createDto.IsMythical,
                // Default required values if not in DTO
                Height = 0,
                Weight = 0,
                BaseExperience = 0
            };

            // Mapping types from string list to existing database entities
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

            // Return 201 Created with Location header
            return CreatedAtAction(nameof(GetPokemon), new { id = pokemon.Id }, pokemon);
        }

        // PUT: /api/pokemons/{id}
        // Task 2.4.3: Update Pokemon & Task 2.4.5: Admin only
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> PutPokemon(int id, UpdatePokemonDto updateDto)
        {
            var pokemon = await _context.Pokemons
                .Include(p => p.PokemonTypes)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (pokemon == null) return NotFound();

            // Partial update logic
            if (!string.IsNullOrEmpty(updateDto.Name)) pokemon.Name = updateDto.Name;
            if (!string.IsNullOrEmpty(updateDto.ImageUrl)) pokemon.ImageUrl = updateDto.ImageUrl;
            if (updateDto.Generation.HasValue) pokemon.Generation = updateDto.Generation.Value;
            if (updateDto.IsLegendary.HasValue) pokemon.IsLegendary = updateDto.IsLegendary.Value;
            if (updateDto.IsMythical.HasValue) pokemon.IsMythical = updateDto.IsMythical.Value;

            // Update types relationship
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
        // Task 2.4.4: Delete Pokemon & Task 2.4.5: Admin only
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