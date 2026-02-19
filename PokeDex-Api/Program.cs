using Microsoft.AspNetCore.Identity;
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

var app = builder.Build();

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
        }
    }
}

// 5. Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();   // Fix para sa Swagger error
    app.UseSwaggerUI(); // Fix para sa Swagger error
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();