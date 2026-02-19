using Microsoft.AspNetCore.Identity;
<<<<<<< HEAD
using Microsoft.EntityFrameworkCore;
using ResourceApi.Data; // Siguraduhin na tama ang namespace ng DbContext mo

var builder = WebApplication.CreateBuilder(args);

// 1. Add services to the container.
builder.Services.AddControllers(); // Importante para sa API
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); // Fix para sa Swagger error

// 2. Database Configuration (EF Core 9.0)
builder.Services.AddDbContext<PokemonDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Identity services
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddEntityFrameworkStores<PokemonDbContext>() // Idinugtong natin sa context mo
    .AddDefaultTokenProviders()
    .AddRoles<IdentityRole>();
=======

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddOpenApi();
>>>>>>> dev-backend

// Add Identity services if not already configured (needed for RoleManager/UserManager)
builder.Services.AddIdentity<IdentityUser, IdentityRole>()
    .AddDefaultTokenProviders()
    .AddRoles<IdentityRole>();

var app = builder.Build();

<<<<<<< HEAD
// 4. Seed Default Roles & Admin User (Yung task ng team niyo)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var roleManager = services.GetService<RoleManager<IdentityRole>>();
    var userManager = services.GetService<UserManager<IdentityUser>>();

    if (roleManager != null)
    {
        string[] roles = { "Admin", "User" };
        foreach (var role in roles)
        {
            var exists = await roleManager.RoleExistsAsync(role);
            if (!exists) await roleManager.CreateAsync(new IdentityRole(role));
        }
    }

    if (userManager != null)
    {
        var adminEmail = "admin@pokedex.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            var user = new IdentityUser { UserName = adminEmail, Email = adminEmail, EmailConfirmed = true };
            await userManager.CreateAsync(user, "Admin123!");
            await userManager.AddToRoleAsync(user, "Admin");
=======
// ===============================
<<<<<<< HEAD
// Task 1.3.1 & 1.3.2 — Seed Default Roles & Admin User
=======
// Task 1.3.1 — Seed Default Roles
>>>>>>> dev-backend
// ===============================
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
<<<<<<< HEAD

    var roleManager = services.GetService<RoleManager<IdentityRole>>();
    var userManager = services.GetService<UserManager<IdentityUser>>();

    // Seed roles
    if (roleManager != null)
    {
        string[] roles = { "Admin", "User" };

        foreach (var role in roles)
        {
            var exists = await roleManager.RoleExistsAsync(role);
            if (!exists)
            {
                await roleManager.CreateAsync(new IdentityRole(role));
                Console.WriteLine($"Role '{role}' created.");
            }
        }
    }

    // Seed default admin user
    if (userManager != null && roleManager != null)
    {
        var adminEmail = "admin@pokedex.com";

        var adminUser = await userManager.FindByEmailAsync(adminEmail);
        if (adminUser == null)
        {
            var user = new IdentityUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(user, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(user, "Admin");
                Console.WriteLine("Default admin user created successfully.");
            }
            else
            {
                foreach (var error in result.Errors)
                {
                    Console.WriteLine($"Error creating admin: {error.Description}");
                }
            }
        }
        else
        {
            Console.WriteLine("Default admin user already exists. Skipping creation.");
=======
    var roleManager = services.GetService<RoleManager<IdentityRole>>();

    if (roleManager != null)
    {
        // Gawa tayo ng temporary async scope para sa await
        await SeedRoles(roleManager);
    }
}

// Helper method para sa seeding (Async)
async Task SeedRoles(RoleManager<IdentityRole> roleManager)
{
    string[] roles = { "Admin", "User" };
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
>>>>>>> dev-backend
>>>>>>> dev-backend
        }
    }
}

<<<<<<< HEAD
// 5. Configure the HTTP request pipeline.
=======
// Configure the HTTP request pipeline.
>>>>>>> dev-backend
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();   // Fix para sa Swagger error
    app.UseSwaggerUI(); // Fix para sa Swagger error
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

<<<<<<< HEAD
app.Run();
=======
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
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
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
>>>>>>> dev-backend
