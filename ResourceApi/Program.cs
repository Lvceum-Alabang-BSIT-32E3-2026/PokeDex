using Microsoft.EntityFrameworkCore;
using ResourceApi.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi(); // Optional .NET 9 feature

// 2. Register PokemonDbContext with SQLite
// Note: Make sure "DefaultConnection" matches the name in your appsettings.json
builder.Services.AddDbContext<PokemonDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
);

var app = builder.Build();

// 3. Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();

// 4. Map controllers (This allows your PokemonsController to work)
app.MapControllers();

app.Run();