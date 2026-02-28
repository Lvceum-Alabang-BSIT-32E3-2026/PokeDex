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
        public async Task<ActionResult<PokemonListDto>> GetPokemons([FromQuery] int offset = 0, [FromQuery] int limit = 20)
        {
            var query = _context.Pokemons
                .Include(p => p.PokemonTypes)
                    .ThenInclude(pt => pt.Type)
                .AsQueryable();

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

            if (pokemon == null)
            {
                return NotFound();
            }

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
    }
}
