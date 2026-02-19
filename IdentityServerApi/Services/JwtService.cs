using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IdentityServerApi.Models;
using Microsoft.IdentityModel.Tokens;

namespace IdentityServerApi.Services;

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(ApplicationUser user, IList<string> roles)
    {
        // Base claims per task specification
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email ?? ""),
            new Claim(ClaimTypes.Name, user.UserName ?? ""),
            new Claim("displayName", user.DisplayName ?? user.UserName ?? "")
        };

        // Add role claims
        foreach (var role in roles)
            claims.Add(new Claim(ClaimTypes.Role, role));

        // Signing key
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]!)
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Expiration from config
        var expirationMinutes = int.Parse(
            _configuration["JwtSettings:ExpirationInMinutes"]!
        );

        // Build token
        var token = new JwtSecurityToken(
            issuer: _configuration["JwtSettings:Issuer"],
            audience: _configuration["JwtSettings:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
