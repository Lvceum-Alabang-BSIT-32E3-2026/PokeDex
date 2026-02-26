using ResourceApi.Data;
using ResourceApi.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;

namespace ResourceApi.Data
{
    public static class SeedData
    {
        public static void Initialize(PokemonDbContext context)
        {
            // Siguraduhin na may Master List ng Types muna
            SeedPokemonTypes(context);

            // Seed ang Pokemon at i-link sila sa Types
            SeedGen1Pokemon(context);
        }

        public static void SeedPokemonTypes(PokemonDbContext context)
        {
            // FIX: Gamitin ang PokemonTypeEntities (Master List)
            if (context.PokemonTypeEntities.Any()) return;

            var types = new List<PokemonTypeEntity>
            {
                new PokemonTypeEntity { Name = "Normal", Color = "#A8A77A" },
                new PokemonTypeEntity { Name = "Fire", Color = "#EE8130" },
                new PokemonTypeEntity { Name = "Water", Color = "#6390F0" },
                new PokemonTypeEntity { Name = "Electric", Color = "#F7D02C" },
                new PokemonTypeEntity { Name = "Grass", Color = "#7AC74C" },
                new PokemonTypeEntity { Name = "Poison", Color = "#A33EA1" },
                new PokemonTypeEntity { Name = "Flying", Color = "#A98FF3" }
                // Maaari mong dagdagan ang iba pang types dito...
            };

            context.PokemonTypeEntities.AddRange(types);
            context.SaveChanges();
        }

        public static void SeedGen1Pokemon(PokemonDbContext context)
        {
            if (context.Pokemons.Any()) return;

            // Kunin ang Master List ng Types para sa linking
            var allTypes = context.PokemonTypeEntities.ToList();

            var bulbasaur = new Pokemon
            {
                PokedexNumber = 1,
                Name = "Bulbasaur",
                ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
                Generation = 1,
                BaseExperience = 64,
                Height = 0.7m,
                Weight = 6.9m
            };

            // FIX: I-link si Bulbasaur sa Grass at Poison gamit ang Join Table
            bulbasaur.PokemonTypes = new List<PokemonType>
            {
                new PokemonType { Pokemon = bulbasaur, Type = allTypes.First(t => t.Name == "Grass"), IsPrimary = true },
                new PokemonType { Pokemon = bulbasaur, Type = allTypes.First(t => t.Name == "Poison"), IsPrimary = false }
            };

            var pikachu = new Pokemon
            {
                PokedexNumber = 25,
                Name = "Pikachu",
                ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
                Generation = 1,
                BaseExperience = 112,
                Height = 0.4m,
                Weight = 6.0m
            };

            pikachu.PokemonTypes = new List<PokemonType>
            {
                new PokemonType { Pokemon = pikachu, Type = allTypes.First(t => t.Name == "Electric"), IsPrimary = true }
            };

            context.Pokemons.AddRange(bulbasaur, pikachu);
            context.SaveChanges();
        }
    }
}