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
        // Task 2.4.3: Implement Update Pokemon Endpoint
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
        // Task 2.4.4: Implement Delete Pokemon Endpoint
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Requirement: Admin role only
        public async Task<IActionResult> DeletePokemon(int id)
        {
            // 1. Hanapin ang pokemon base sa ID
            var pokemon = await _context.Pokemons.FindAsync(id);

            // 2. Pag wala, return 404
            if (pokemon == null)
            {
                return NotFound();
            }

            // 3. Burahin ang record
            _context.Pokemons.Remove(pokemon);
            await _context.SaveChangesAsync();

            // 4. Return 204 No Content (Standard success response para sa Delete)
            return NoContent();
        }
    }
}