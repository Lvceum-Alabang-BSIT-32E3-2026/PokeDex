using IdentityServerApi.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace IdentityServerApi.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        // FIX: Pinalitan ang IdentityUser ng ApplicationUser para sa DI container
        private readonly UserManager<ApplicationUser> _userManager;

        public UsersController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        // ==========================================
        // GET /api/users/me
        // ==========================================
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User?.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new
            {
                user.Id,
                user.UserName,
                user.Email,
                DisplayName = user.UserName,
                Roles = roles
            });
        }

        // ==========================================
        // PUT /api/users/me (Task 1.4.1)
        // ==========================================
        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            // FIX: Ginamit ang ModelState validation imbes na manual checks
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User?.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();

            // Dito mo i-update ang properties base sa DTO mo
            user.UserName = dto.DisplayName;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors.Select(e => e.Description));

            return Ok(new { Message = "Profile updated successfully." });
        }

        // ==========================================
        // POST /api/users/me/change-password (Task 1.4.2)
        // ==========================================
        [HttpPost("me/change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            // FIX: Validation via Data Annotations (Dahil sa [Required] sa DTO)
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userId = User?.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();

            // Ginamit ang built-in rotation logic gaya ng requirement
            var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

            if (!result.Succeeded)
            {
                // Returns error if current password is wrong or doesn't meet complexity
                return BadRequest(result.Errors.Select(e => e.Description));
            }

            return Ok(new { Message = "Password changed successfully." });
        }
    }
}