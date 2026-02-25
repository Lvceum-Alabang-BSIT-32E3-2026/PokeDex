using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ResourceApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // 🔒 All endpoints require authentication
    public class CapturesController : ControllerBase
    {
        // GET: api/captures
        [HttpGet]
        public IActionResult GetAllCaptures()
        {
            // TODO: Replace with actual service/database logic
            return Ok(new
            {
                message = "Authenticated: Retrieved all captures successfully."
            });
        }

        // GET: api/captures/{id}
        [HttpGet("{id}")]
        public IActionResult GetCaptureById(int id)
        {
            // TODO: Replace with actual service/database logic
            return Ok(new
            {
                message = $"Authenticated: Retrieved capture with ID {id}."
            });
        }

        // POST: api/captures
        [HttpPost]
        public IActionResult CreateCapture([FromBody] object captureDto)
        {
            // TODO: Replace with actual service/database logic
            return Ok(new
            {
                message = "Authenticated: Capture created successfully."
            });
        }

        // DELETE: api/captures/{id}
        [HttpDelete("{id}")]
        public IActionResult DeleteCapture(int id)
        {
            // TODO: Replace with actual service/database logic
            return Ok(new
            {
                message = $"Authenticated: Capture with ID {id} deleted successfully."
            });
        }
    }
}