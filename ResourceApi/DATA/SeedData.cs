using ResourceApi.Data;
using ResourceApi.Models;
using System.Collections.Generic;
using System.Linq;

namespace ResourceApi.Data
{
    public static class SeedData
    {
        public static void Initialize(PokemonDbContext context)
        {
            // Siguraduhin na may Types muna bago ang Pokemon
            SeedPokemonTypes(context);
            SeedGen1Pokemon(context);
        }

        public static void SeedPokemonTypes(PokemonDbContext context)
        {
            // TAMA: PokemonTypeEntity ang ginagamit para sa Name at Color
            if (context.Types.Any()) return;

            var types = new List<PokemonTypeEntity>
            {
                new PokemonTypeEntity { Name = "Normal", Color = "#A8A77A" },
                new PokemonTypeEntity { Name = "Fire", Color = "#EE8130" },
                new PokemonTypeEntity { Name = "Water", Color = "#6390F0" },
                new PokemonTypeEntity { Name = "Electric", Color = "#F7D02C" },
                new PokemonTypeEntity { Name = "Grass", Color = "#7AC74C" },
                new PokemonTypeEntity { Name = "Poison", Color = "#A33EA1" },
                // ... idagdag ang iba pa rito
            };

            context.Types.AddRange(types);
            context.SaveChanges();
        }

        public static void SeedGen1Pokemon(PokemonDbContext context)
        {
            if (context.Pokemons.Any()) return;

            var pokemonList = new List<Pokemon>
            {
                new Pokemon
                {
                    PokedexNumber = 1,
                    Name = "Bulbasaur",
                    ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
                    Generation = 1,
                    BaseExperience = 64,
                    Height = 0.7m,
                    Weight = 6.9m
                },
                new Pokemon
                {
                    PokedexNumber = 4,
                    Name = "Charmander",
                    ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
                    Generation = 1,
                    BaseExperience = 62,
                    Height = 0.6m,
                    Weight = 8.5m
                }
            };

            context.Pokemons.AddRange(pokemonList);
            context.SaveChanges();
        }
    }
}