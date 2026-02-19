using Microsoft.EntityFrameworkCore;
using ResourceApi.Data;

var builder = WebApplication.CreateBuilder(args);

<<<<<<< HEAD
// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure DbContext with SQLite
builder.Services.AddDbContext<PokemonDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("PokemonDb"))
);
=======
// Add services to the container.
builder.Services.AddControllers();

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi(); // optional if you want OpenAPI

// --- THIS IS CRITICAL ---
// Register PokemonDbContext with SQLite connection
builder.Services.AddDbContext<PokemonDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
>>>>>>> dev-backend

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
<<<<<<< HEAD
=======
    app.MapOpenApi(); // optional
>>>>>>> dev-backend
}

app.UseHttpsRedirection();
app.UseAuthorization();

<<<<<<< HEAD
// Map controllers (PokemonsController, etc.)
app.MapControllers();

// Optional: keep the old WeatherForecast endpoint if you want
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
=======
app.MapControllers();
>>>>>>> dev-backend

app.Run();
