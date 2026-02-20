UsersController.cs

using IdentityServerApi.DTOs;
using IdentityServerApi.Models; // Siguraduhin na nandito ang ApplicationUser model
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace IdentityServerApi.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UsersController : ControllerBase
    {
        private readonly UserManager _userManager;

        public UsersController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        // ==========================================
        // GET /api/users/me (Task 1.3.3 Fix)
        // ==========================================
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
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
                DisplayName = user.DisplayName, // FIX: Iniba sa user.UserName; dapat actual DisplayName field
                Roles = roles
            });
        }

        // ==========================================
        // PUT /api/users/me (Task 1.4.1 Fix)
        // ==========================================
        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();

            // FIX: Update the DisplayName property, NOT the UserName
            user.DisplayName = dto.DisplayName;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                return BadRequest(result.Errors.Select(e => e.Description));

            return Ok(new { Message = "Profile updated successfully." });
        }

        // ==========================================
        // POST /api/users/me/change-password (Task 1.4.2 Fix)
        // ==========================================
        [HttpPost("me/change-password")] // FIX: Path corrected to include /me/
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return Unauthorized();

            // Correctly uses _userManager.ChangePasswordAsync as required
            var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors.Select(e => e.Description));
            }

            return Ok(new { Message = "Password changed successfully." });
        }
    }
}

