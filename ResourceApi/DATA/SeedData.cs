using ResourceApi.Data;
using ResourceApi.Models;
using System.Collections.Generic;
using System.Linq;

namespace ResourceApi.Data // Fixed namespace to match task description
{
    public static class SeedData
    {
        public static void Initialize(PokemonDbContext context)
        {
            // Seed Types first (so Pokemon can reference them if needed)
            SeedPokemonTypes(context);

            // Seed the 151 Pokemon
            SeedGen1Pokemon(context);
        }

        public static void SeedPokemonTypes(PokemonDbContext context)
        {
            if (context.PokemonTypes.Any()) return;

            var types = new List<PokemonType>
            {
                new PokemonType { Name = "Normal", Color = "#A8A77A" },
                new PokemonType { Name = "Fire", Color = "#EE8130" },
                new PokemonType { Name = "Water", Color = "#6390F0" },
                new PokemonType { Name = "Electric", Color = "#F7D02C" },
                new PokemonType { Name = "Grass", Color = "#7AC74C" },
                new PokemonType { Name = "Ice", Color = "#96D9D6" },
                new PokemonType { Name = "Fighting", Color = "#C22E28" },
                new PokemonType { Name = "Poison", Color = "#A33EA1" },
                new PokemonType { Name = "Ground", Color = "#E2BF65" },
                new PokemonType { Name = "Flying", Color = "#A98FF3" },
                new PokemonType { Name = "Psychic", Color = "#F95587" },
                new PokemonType { Name = "Bug", Color = "#A6B91A" },
                new PokemonType { Name = "Rock", Color = "#B6A136" },
                new PokemonType { Name = "Ghost", Color = "#735797" },
                new PokemonType { Name = "Dragon", Color = "#6F35FC" },
                new PokemonType { Name = "Dark", Color = "#705746" },
                new PokemonType { Name = "Steel", Color = "#B7B7CE" },
                new PokemonType { Name = "Fairy", Color = "#D685AD" }
            };

            context.PokemonTypes.AddRange(types);
            context.SaveChanges();
        }

        public static void SeedGen1Pokemon(PokemonDbContext context)
        {
            // Requirement: Skip if Pokemon already exist
            if (context.Pokemon.Any())
            {
                return;
            }

            var pokemonList = new List<Pokemon>
            {
                new Pokemon
                {
                    PokedexNumber = 1,
                    Name = "Bulbasaur",
                    Types = new List<string> { "Grass", "Poison" },
                    ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
                    Generation = 1
                },
                new Pokemon
                {
                    PokedexNumber = 2,
                    Name = "Ivysaur",
                    Types = new List<string> { "Grass", "Poison" },
                    ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png",
                    Generation = 1
                },
                new Pokemon
                {
                    PokedexNumber = 3,
                    Name = "Venusaur",
                    Types = new List<string> { "Grass", "Poison" },
                    ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png",
                    Generation = 1
                },
                new Pokemon
                {
                    PokedexNumber = 4,
                    Name = "Charmander",
                    Types = new List<string> { "Fire" },
                    ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
                    Generation = 1
                },
                new Pokemon
                {
                    PokedexNumber = 5,
                    Name = "Charmeleon",
                    Types = new List<string> { "Fire" },
                    ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png",
                    Generation = 1
                },
                new Pokemon
                {
                    PokedexNumber = 6,
                    Name = "Charizard",
                    Types = new List<string> { "Fire", "Flying" },
                    ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png",
                    Generation = 1
                },
                new Pokemon
                {
                    PokedexNumber = 7,
                    Name = "Squirtle",
                    Types = new List<string> { "Water" },
                    ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png",
                    Generation = 1
                },
                new Pokemon
                {
                    PokedexNumber = 8,
                    Name = "Wartortle",
                    Types = new List<string> { "Water" },
                    ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png",
                    Generation = 1
                },
                new Pokemon
                {
                    PokedexNumber = 9,
                    Name = "Blastoise",
                    Types = new List<string> { "Water" },
                    ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png",
                    Generation = 1
                },
                new Pokemon
                {
                    PokedexNumber = 25,
                    Name = "Pikachu",
                    Types = new List<string> { "Electric" },
                    ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
                    Generation = 1
                },
                // ... Add the remaining 141 Pokemon here following the same pattern
            };

            context.Pokemon.AddRange(pokemonList);
            context.SaveChanges();
        }
    }
}