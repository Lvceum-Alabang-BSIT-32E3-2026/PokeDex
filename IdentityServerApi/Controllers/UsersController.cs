using IdentityServerApi.DTOs;
using IdentityServerApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace IdentityServerApi.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class UsersController : ControllerBase
	{
		private readonly UserManager<ApplicationUser> _userManager;

		public UsersController(UserManager<ApplicationUser> userManager)
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

		// =========================
		// PUT /api/users/me
		// Task 1.4.1
		// =========================
		[HttpPut("me")]
		[Authorize]
		public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
		{
			if (string.IsNullOrWhiteSpace(dto.DisplayName))
				return BadRequest(new { Message = "DisplayName is required." });

			var userId = User?.FindFirst("sub")?.Value;
			if (string.IsNullOrEmpty(userId))
				return Unauthorized();

			var user = await _userManager.FindByIdAsync(userId);
			if (user == null)
				return Unauthorized();

			user.UserName = dto.DisplayName;

			var result = await _userManager.UpdateAsync(user);
			if (!result.Succeeded)
				return BadRequest(result.Errors.Select(e => e.Description));

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

		// =========================
		// POST /api/users/me/change-password
		// Task 1.4.2
		// =========================
		[HttpPost("me/change-password")]
		[Authorize]
		public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
		{
			if (string.IsNullOrWhiteSpace(dto.CurrentPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
				return BadRequest(new { Message = "Current and new passwords are required." });

			var userId = User?.FindFirst("sub")?.Value;
			if (string.IsNullOrEmpty(userId))
				return Unauthorized();

			var user = await _userManager.FindByIdAsync(userId);
			if (user == null)
				return Unauthorized();

			var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
			if (!result.Succeeded)
				return BadRequest(result.Errors.Select(e => e.Description));

			return Ok(new { Message = "Password changed successfully." });
		}
	}
}
