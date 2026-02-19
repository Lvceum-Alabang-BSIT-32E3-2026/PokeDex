using IdentityServerApi.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace IdentityServerApi.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class UsersController : ControllerBase
	{
		private readonly UserManager<IdentityUser> _userManager;

		public UsersController(UserManager<IdentityUser> userManager)
		{
			_userManager = userManager;
		}

		// =========================
		// GET /api/users/me
		// Task 1.3.3
		// =========================
		[HttpGet("me")]
		[Authorize]
		public async Task<IActionResult> GetCurrentUser()
		{
			// Get user ID from JWT claims
			var userId = User?.FindFirst("sub")?.Value;
			if (string.IsNullOrEmpty(userId))
				return Unauthorized();

			// Fetch user from database
			var user = await _userManager.FindByIdAsync(userId);
			if (user == null)
				return Unauthorized();

			// Get user roles
			var roles = await _userManager.GetRolesAsync(user);

			// Return user info
			return Ok(new
			{
				user.Id,
				user.UserName,
				user.Email,
				DisplayName = user.UserName,
				Roles = roles
			});
		}

		// =========================
		// PUT /api/users/me
		// Task 1.4.1
		// =========================
		[HttpPut("me")]
		[Authorize]
		public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
		{
			// Validate input
			if (string.IsNullOrWhiteSpace(dto.DisplayName))
				return BadRequest(new { Message = "DisplayName is required." });

			// Get user ID from JWT claims
			var userId = User?.FindFirst("sub")?.Value;
			if (string.IsNullOrEmpty(userId))
				return Unauthorized();

			// Fetch user from database
			var user = await _userManager.FindByIdAsync(userId);
			if (user == null)
				return Unauthorized();

			// Update DisplayName (mapped to UserName)
			user.UserName = dto.DisplayName;

			var result = await _userManager.UpdateAsync(user);
			if (!result.Succeeded)
			{
				return BadRequest(result.Errors.Select(e => e.Description));
			}

			// Get user roles
			var roles = await _userManager.GetRolesAsync(user);

			// Return updated user info
			return Ok(new
			{
				user.Id,
				user.UserName,
				user.Email,
				DisplayName = user.UserName,
				Roles = roles
			});
		}
	}
}
