using IdentityServerApi.DTOs;
using IdentityServerApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace IdentityServerApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;

    public AuthController(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        // 1. Check if user already exists - Returns 409 Conflict for duplicates
        var userExists = await _userManager.FindByEmailAsync(model.Email);
        if (userExists != null)
        {
            return Conflict(new
            {
                errors = new[]
                {
                    new { code = "DuplicateEmail", description = $"Email '{model.Email}' is already registered." }
                }
            });
        }

        // 2. Create the ApplicationUser object
        var user = new ApplicationUser
        {
            Email = model.Email,
            UserName = model.Username,
            DisplayName = model.DisplayName,
            CreatedAt = DateTime.UtcNow // Ensure we use our custom field
        };

        // 3. Attempt to save to Database
        var result = await _userManager.CreateAsync(user, model.Password);

        if (!result.Succeeded)
        {
            // 4. Map Identity errors to structured objects (code and description)
            var formattedErrors = result.Errors.Select(e => new
            {
                code = e.Code,
                description = e.Description
            });

            return BadRequest(new { errors = formattedErrors });
        }

        // 5. Role Management - Ensure "User" role exists and assign it
        if (!await _roleManager.RoleExistsAsync("User"))
        {
            await _roleManager.CreateAsync(new IdentityRole("User"));
        }

        await _userManager.AddToRoleAsync(user, "User");

        return Ok(new { message = "Registration successful" });
    }
}