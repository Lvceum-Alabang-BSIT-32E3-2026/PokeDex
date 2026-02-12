using IdentityServerApi.DTOs;
using IdentityServerApi.Models;
using IdentityServerApi.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PokeDex_Api.DTOs;

namespace IdentityServerApi.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IJwtService _jwtService;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IJwtService jwtService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _jwtService = jwtService;
    }

    // ============================
    // REGISTER
    // ============================
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        // 1. Check for Duplicate Email manually to return 409 Conflict
        var userExists = await _userManager.FindByEmailAsync(model.Email);
        if (userExists != null)
        {
            return Conflict(new
            {
                errors = new[] { MapError("DuplicateEmail", model.Email) }
            });
        }

        var user = new ApplicationUser
        {
            Email = model.Email,
            UserName = model.Username,
            DisplayName = model.DisplayName,
            CreatedAt = DateTime.UtcNow
        };

        // 2. Create User
        var result = await _userManager.CreateAsync(user, model.Password);

        if (!result.Succeeded)
        {
            var formattedErrors = result.Errors
                .Select(e => MapError(e.Code, e.Description));

            return BadRequest(new { errors = formattedErrors });
        }

        // 3. Role Assignment
        if (!await _roleManager.RoleExistsAsync("User"))
        {
            await _roleManager.CreateAsync(new IdentityRole("User"));
        }

        await _userManager.AddToRoleAsync(user, "User");

        return Ok(new { message = "Registration successful" });
    }

    // ============================
    // LOGIN
    // ============================
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        // 1. Find user by email
        var user = await _userManager.FindByEmailAsync(model.Email);

        if (user == null)
            return Unauthorized(new { message = "Invalid email or password." });

        // 2. Check password
        var isPasswordValid = await _userManager.CheckPasswordAsync(user, model.Password);

        if (!isPasswordValid)
            return Unauthorized(new { message = "Invalid email or password." });

        // 3. Get user roles
        var roles = await _userManager.GetRolesAsync(user);

        // 4. Generate JWT
        var token = _jwtService.GenerateToken(user, roles);

        // 5. Return token response
        return Ok(new TokenResponseDto
        {
            Token = token,
            Email = user.Email ?? string.Empty,
            Username = user.UserName ?? string.Empty,
            DisplayName = user.DisplayName ?? user.UserName ?? string.Empty
        });
    }

    // ============================
    // ERROR MAPPING
    // ============================
    private object MapError(string code, string description)
    {
        return code switch
        {
            "DuplicateEmail" => new
            {
                code,
                description = $"Email '{description}' is already registered."
            },
            "DuplicateUserName" => new
            {
                code,
                description = "This username is already taken."
            },
            "PasswordTooShort" => new
            {
                code,
                description = "Password must be at least 8 characters."
            },
            "PasswordRequiresDigit" => new
            {
                code,
                description = "Password must contain at least one digit (0-9)."
            },
            "PasswordRequiresUpper" => new
            {
                code,
                description = "Password must contain at least one uppercase letter."
            },
            "PasswordRequiresLower" => new
            {
                code,
                description = "Password must contain at least one lowercase letter."
            },
            _ => new { code, description }
        };
    }
}
