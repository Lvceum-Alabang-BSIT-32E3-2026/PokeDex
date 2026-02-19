using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

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

		// GET: /api/users
		[HttpGet]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> GetAllUsers()
		{
			var users = _userManager.Users.ToList();

			var userList = new List<object>();

			foreach (var user in users)
			{
				var roles = await _userManager.GetRolesAsync(user);
				userList.Add(new
				{
					Id = user.Id,
					Username = user.UserName,
					Email = user.Email,
					Roles = roles
				});
			}

			return Ok(userList);
		}

		// PUT: /api/users/{id}/role
		[HttpPut("{id}/role")]
		[Authorize(Roles = "Admin")]
		public async Task<IActionResult> AssignRole(string id, [FromBody] RoleDto roleDto)
		{
			var user = await _userManager.FindByIdAsync(id);
			if (user == null) return NotFound("User not found");

			var currentRoles = await _userManager.GetRolesAsync(user);

			// Prevent removing the last admin
			if (currentRoles.Contains("Admin") && roleDto.Role != "Admin")
			{
				var allAdmins = (await _userManager.GetUsersInRoleAsync("Admin")).Count;
				if (allAdmins <= 1)
					return BadRequest("Cannot remove the last Admin");
			}

			// Remove all roles and assign new role
			await _userManager.RemoveFromRolesAsync(user, currentRoles);
			await _userManager.AddToRoleAsync(user, roleDto.Role);

			// Return updated user info
			var updatedRoles = await _userManager.GetRolesAsync(user);
			return Ok(new
			{
				Id = user.Id,
				Username = user.UserName,
				Email = user.Email,
				Roles = updatedRoles
			});
		}
	}

	// DTO for role assignment
	public class RoleDto
	{
		public string Role { get; set; }
	}
}
