using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PokeDex_Api.Data;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"];
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret!))
        };
    });

builder.Services.AddAuthorization();

// Add Controllers
builder.Services.AddControllers();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Add Authentication & Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

// Map Controllers
app.MapControllers();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
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

// ===== TEST ENDPOINTS FOR TASK 3.1.1 VERIFICATION =====

// Test endpoint: Verify database connection and table counts
app.MapGet("/api/test/database", async (ApplicationDbContext db) =>
{
    try
    {
        var canConnect = await db.Database.CanConnectAsync();
        var pokemonCount = await db.Pokemons.CountAsync();
        var captureCount = await db.Captures.CountAsync();
        
        return Results.Ok(new
        {
            Status = "Success",
            DatabaseConnected = canConnect,
            DatabaseName = "PokedexDb",
            Tables = new
            {
                Pokemons = new { Count = pokemonCount, Exists = true },
                Captures = new { Count = captureCount, Exists = true }
            },
            Message = "Database connection successful! All tables exist.",
            Timestamp = DateTime.UtcNow
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            title: "Database Connection Failed",
            detail: ex.Message,
            statusCode: 500
        );
    }
})
.WithName("TestDatabaseConnection")
.WithTags("Testing");

// Test endpoint: Get Pokemons table schema
app.MapGet("/api/test/schema/pokemons", async (ApplicationDbContext db) =>
{
    try
    {
        var connection = db.Database.GetDbConnection();
        await connection.OpenAsync();
        
        var command = connection.CreateCommand();
        command.CommandText = @"
            SELECT 
                COLUMN_NAME as ColumnName, 
                DATA_TYPE as DataType, 
                CHARACTER_MAXIMUM_LENGTH as MaxLength,
                IS_NULLABLE as IsNullable
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Pokemons'
            ORDER BY ORDINAL_POSITION";
        
        var reader = await command.ExecuteReaderAsync();
        var columns = new List<object>();
        
        while (await reader.ReadAsync())
        {
            columns.Add(new
            {
                ColumnName = reader["ColumnName"].ToString(),
                DataType = reader["DataType"].ToString(),
                MaxLength = reader["MaxLength"] == DBNull.Value ? null : reader["MaxLength"].ToString(),
                IsNullable = reader["IsNullable"].ToString()
            });
        }
        
        await reader.CloseAsync();
        await connection.CloseAsync();
        
        return Results.Ok(new { TableName = "Pokemons", Columns = columns });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            title: "Failed to retrieve schema",
            detail: ex.Message,
            statusCode: 500
        );
    }
})
.WithName("GetPokemonsSchema")
.WithTags("Testing");

// Test endpoint: Get Captures table schema
app.MapGet("/api/test/schema/captures", async (ApplicationDbContext db) =>
{
    try
    {
        var connection = db.Database.GetDbConnection();
        await connection.OpenAsync();
        
        var command = connection.CreateCommand();
        command.CommandText = @"
            SELECT 
                COLUMN_NAME as ColumnName, 
                DATA_TYPE as DataType, 
                CHARACTER_MAXIMUM_LENGTH as MaxLength,
                IS_NULLABLE as IsNullable
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Captures'
            ORDER BY ORDINAL_POSITION";
        
        var reader = await command.ExecuteReaderAsync();
        var columns = new List<object>();
        
        while (await reader.ReadAsync())
        {
            columns.Add(new
            {
                ColumnName = reader["ColumnName"].ToString(),
                DataType = reader["DataType"].ToString(),
                MaxLength = reader["MaxLength"] == DBNull.Value ? null : reader["MaxLength"].ToString(),
                IsNullable = reader["IsNullable"].ToString()
            });
        }
        
        await reader.CloseAsync();
        await connection.CloseAsync();
        
        return Results.Ok(new { TableName = "Captures", Columns = columns });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            title: "Failed to retrieve schema",
            detail: ex.Message,
            statusCode: 500
        );
    }
})
.WithName("GetCapturesSchema")
.WithTags("Testing");

// Test endpoint: Get all Pokemons (for verification)
app.MapGet("/api/test/pokemons", async (ApplicationDbContext db) =>
{
    var pokemons = await db.Pokemons.ToListAsync();
    return Results.Ok(new
    {
        Count = pokemons.Count,
        Data = pokemons
    });
})
.WithName("GetAllPokemonsTest")
.WithTags("Testing");

// Test endpoint: Get all Captures with Pokemon details (for verification)
app.MapGet("/api/test/captures", async (ApplicationDbContext db) =>
{
    var captures = await db.Captures
        .Include(c => c.Pokemon)
        .Select(c => new
        {
            c.Id,
            c.UserId,
            c.PokemonId,
            PokemonName = c.Pokemon.Name,
            PokemonType = c.Pokemon.Type,
            c.CapturedAt
        })
        .ToListAsync();
    
    return Results.Ok(new
    {
        Count = captures.Count,
        Data = captures
    });
})
.WithName("GetAllCapturesTest")
.WithTags("Testing");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
