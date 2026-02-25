using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResourceApi.Data;

namespace ResourceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // 🔒 All endpoints require authentication
    public class CapturesController : ControllerBase
    {
        private readonly PokemonDbContext _context;

        public CapturesController(PokemonDbContext context)
        {
            _context = context;
        }

        // Endpoints will be implemented in the next tasks
    }
}