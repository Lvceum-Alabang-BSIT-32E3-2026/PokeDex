using Microsoft.EntityFrameworkCore;
using ResourceApi.Data;

var builder = WebApplication.CreateBuilder(args);

// --- SERVICES CONFIGURATION ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


// 1. CORS Configuration: Dito nire-register ang policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Siguraduhin na ang origin na ito ay tugma sa port ng iyong frontend
        policy.WithOrigins("http://localhost:5173")

// Task 2.1.10: Enable CORS (Allow frontend access)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Frontend URL

              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<PokemonDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"))
);

var app = builder.Build();

// --- SEEDING LOGIC ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<PokemonDbContext>();
        context.Database.EnsureCreated();
        SeedData.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Nagkaroon ng error sa pag-seed ng database.");
    }
}

// --- MIDDLEWARE PIPELINE ---
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();


// 2. CORS Middleware: Dapat itong ilagay bago ang Authorization
app.UseCors("AllowFrontend");


// Task 2.1.10: CORS must be placed after UseRouting (implicit) and before UseAuthorization
app.UseCors();

app.UseAuthentication(); // Siguraduhing nandito ito kung may JWT ka na

app.UseAuthorization();

app.MapControllers();

app.Run();