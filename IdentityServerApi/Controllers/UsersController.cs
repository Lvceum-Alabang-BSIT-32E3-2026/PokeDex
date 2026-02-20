using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace IdentityServerApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Requirement: Requires authentication
    public class UsersController : ControllerBase
    {
        // GET /api/users/me
        [HttpGet("me")]
        public IActionResult GetCurrentUser()
        {
            // Requirement: Extract user ID (or NameIdentifier) from JWT claims
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(); // Requirement: Returns 401 if not authenticated/no claim
            }

            // Mocking the user fetch logic - replace with your actual Service/DB call
            // Requirement: Return user email, username, displayName, and roles
            var userProfile = new
            {
                Username = User.Identity?.Name,
                Email = User.FindFirst(ClaimTypes.Email)?.Value,
                DisplayName = User.FindFirst("display_name")?.Value ?? "User Name", // Requirement: DisplayName was missing
                Roles = User.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList() // Requirement: Array of roles
            };

            return Ok(userProfile);
        }
    }
}