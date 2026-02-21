using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using ResourceApi.Models;
using System;
using System.Linq;

namespace ResourceApi.Data;

public static class SeedData
{
    public static void Initialize(IServiceProvider serviceProvider)
    {
        using (var context = new PokemonDbContext(
            serviceProvider.GetRequiredService<DbContextOptions<PokemonDbContext>>()))
        {
            // Palitan ang .Pokemon ng .Pokemons (may 's')
            if (context.Pokemons.Any())
            {
                return;   // DB has already been seeded
            }

            context.Pokemons.AddRange(
                new Pokemon
                {
                    Name = "Bulbasaur",
                    PokedexNumber = 1,
                    ImageUrl = "bulbasaur.png",
                    Generation = 1,
                    Height = 0.7m,        // Task 2.3.3: Accurate height
                    Weight = 6.9m,        // Task 2.3.3: Accurate weight
                    BaseExperience = 64
                },
                new Pokemon
                {
                    Name = "Charmander",
                    PokedexNumber = 4,
                    ImageUrl = "charmander.png",
                    Generation = 1,
                    Height = 0.6m,
                    Weight = 8.5m,
                    BaseExperience = 62
                }
            );
            context.SaveChanges();
        }
    }
}