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
	}
}
