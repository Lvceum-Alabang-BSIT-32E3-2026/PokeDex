using IdentityServerApi.DTOs;
using IdentityServerApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace IdentityServerApi.Controllers;

[Route("api/users")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IConfiguration _configuration;

    public AuthController(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
    }

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
            // Map technical Identity errors to user-friendly messages
            var formattedErrors = result.Errors.Select(e => MapError(e.Code, e.Description));
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

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
        {
            var userRoles = await _userManager.GetRolesAsync(user);

            var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.UserName!),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            };

            foreach (var userRole in userRoles)
            {
                authClaims.Add(new Claim(ClaimTypes.Role, userRole));
            }

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                expires: DateTime.Now.AddMinutes(double.Parse(_configuration["Jwt:ExpirationInMinutes"]!)),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return Ok(new TokenResponseDto
            {
                Token = new JwtSecurityTokenHandler().WriteToken(token),
                Expiration = token.ValidTo,
                User = new UserResponseDto
                {
                    Id = user.Id,
                    Username = user.UserName!,
                    Email = user.Email!,
                    DisplayName = user.DisplayName,
                    Roles = userRoles.ToList()
                }
            });
        }
        return Unauthorized();
    }

    // Helper method to fulfill Requirement: "Map Identity error codes to user-friendly messages"
    private object MapError(string code, string description)
    {
        return code switch
        {
            "DuplicateEmail" => new { code, description = $"Email '{description}' is already registered." },
            "DuplicateUserName" => new { code, description = "This username is already taken." },
            "PasswordTooShort" => new { code, description = "Password must be at least 8 characters." },
            "PasswordRequiresDigit" => new { code, description = "Password must contain at least one digit (0-9)." },
            "PasswordRequiresUpper" => new { code, description = "Password must contain at least one uppercase letter." },
            "PasswordRequiresLower" => new { code, description = "Password must contain at least one lowercase letter." },
            _ => new { code, description } // Fallback for any other errors
        };
    }
}