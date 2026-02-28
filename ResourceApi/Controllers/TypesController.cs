using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ResourceApi.Data;
using ResourceApi.Models;

namespace ResourceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TypesController : ControllerBase
    {
        private readonly PokemonDbContext _context;

        public TypesController(PokemonDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PokemonTypeEntity>>> GetTypes()
        {
            var types = await _context.PokemonTypeEntities
                .OrderBy(t => t.Name)
                .ToListAsync();

            return Ok(types);
        }
    }
}
