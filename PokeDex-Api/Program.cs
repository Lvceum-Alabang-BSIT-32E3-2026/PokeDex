using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// IMPORTANT: Authentication must come before Authorization
app.UseAuthentication();
app.UseAuthorization();

// Test Endpoints

// 1. Public endpoint - No authentication required
app.MapGet("/api/public", () =>
{
    return Results.Ok(new
    {
        message = "This is a public endpoint. No authentication required.",
        timestamp = DateTime.UtcNow
    });
})
.WithName("PublicEndpoint")
.WithOpenApi();

// 2. Protected endpoint - Requires valid JWT token
app.MapGet("/api/protected", [Authorize] (ClaimsPrincipal user) =>
{
    var userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    var email = user.FindFirst(ClaimTypes.Email)?.Value;
    var roles = user.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();

    return Results.Ok(new
    {
        message = "You have accessed a protected endpoint!",
        userId = userId,
        email = email,
        roles = roles,
        timestamp = DateTime.UtcNow
    });
})
.WithName("ProtectedEndpoint")
.RequireAuthorization()
.WithOpenApi();

// 3. Admin-only endpoint - Requires Admin role
app.MapGet("/api/admin", [Authorize(Roles = "Admin")] (ClaimsPrincipal user) =>
{
    var email = user.FindFirst(ClaimTypes.Email)?.Value;

    return Results.Ok(new
    {
        message = "Welcome Admin! This endpoint is only accessible to administrators.",
        email = email,
        timestamp = DateTime.UtcNow
    });
})
.WithName("AdminEndpoint")
.RequireAuthorization()
.WithOpenApi();

// 4. User endpoint - Requires User role
app.MapGet("/api/user", [Authorize(Roles = "User")] (ClaimsPrincipal user) =>
{
    var email = user.FindFirst(ClaimTypes.Email)?.Value;

    return Results.Ok(new
    {
        message = "Welcome User! This endpoint is accessible to regular users.",
        email = email,
        timestamp = DateTime.UtcNow
    });
})
.WithName("UserEndpoint")
.RequireAuthorization()
.WithOpenApi();

// Original weather forecast endpoint (now protected)
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", [Authorize] () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.RequireAuthorization()
.WithOpenApi();

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
