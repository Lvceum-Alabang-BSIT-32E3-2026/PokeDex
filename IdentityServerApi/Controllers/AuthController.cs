using IdentityServerApi.DTOs;
using IdentityServerApi.Models;
using IdentityServerApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace IdentityServerApi.Controllers;

[Route("api/auth")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IConfiguration _configuration;
    private readonly IJwtService _jwtService;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IConfiguration configuration,
        IJwtService jwtService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
        _jwtService = jwtService;
    }

    // ===============================
    // REGISTER ENDPOINT
    // ===============================
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        // 1️ Check duplicate email
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

        // 2️ Create user
        var result = await _userManager.CreateAsync(user, model.Password);

        if (!result.Succeeded)
        {
            var formattedErrors = result.Errors
                .Select(e => MapError(e.Code, e.Description));

            return BadRequest(new { errors = formattedErrors });
        }

        // 3️ Ensure Role exists
        if (!await _roleManager.RoleExistsAsync("User"))
        {
            await _roleManager.CreateAsync(new IdentityRole("User"));
        }

        await _userManager.AddToRoleAsync(user, "User");

        return Ok(new { message = "Registration successful" });
    }

    // ===============================
    // LOGIN ENDPOINT
    // ===============================
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        // 1️ Find user by email
        var user = await _userManager.FindByEmailAsync(model.Email);

        if (user == null)
            return Unauthorized(new { message = "Invalid email or password" });

        // 2️ Validate password
        var isValidPassword = await _userManager
            .CheckPasswordAsync(user, model.Password);

        if (!isValidPassword)
            return Unauthorized(new { message = "Invalid email or password" });

        // 3️ Get user roles
        var roles = await _userManager.GetRolesAsync(user);

        // 4️ Generate JWT token using service
        var token = await _jwtService.GenerateToken(user);

        var expirationMinutes = int.Parse(
            _configuration["JwtSettings:ExpirationInMinutes"]!
        );

        // 5️ Return response
        return Ok(new TokenResponseDto
        {
            Token = token,
            Expiration = DateTime.UtcNow.AddMinutes(expirationMinutes),
            User = new UserResponseDto
            {
                Id = user.Id,
                Username = user.UserName!,
                Email = user.Email!,
                DisplayName = user.DisplayName,
                Roles = roles.ToList()
            }
        });
    }

    // ===============================
    // ME ENDPOINT (requires valid JWT)
    // ===============================
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { message = "User not found in token." });

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return Unauthorized(new { message = "User no longer exists." });

        var roles = await _userManager.GetRolesAsync(user);

        return Ok(new UserResponseDto
        {
            Id = user.Id,
            Username = user.UserName!,
            Email = user.Email!,
            DisplayName = user.DisplayName,
            Roles = roles.ToList()
        });
    }

    // ===============================
    // ERROR MAPPING HELPER
    // ===============================
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
