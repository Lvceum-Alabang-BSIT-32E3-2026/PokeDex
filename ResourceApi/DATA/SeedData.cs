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
            // Seed Types first
            SeedPokemonTypes(context);

            // Seed the Pokemon
            SeedGen1Pokemon(context);
        }

        public static void SeedPokemonTypes(PokemonDbContext context)
        {
            // Siguraduhin na PokemonTypes ang tawag (base sa DbContext)
            if (context.PokemonTypes.Any()) return;

            // Pinalitan ang PokemonType -> PokemonTypeEntity
            var types = new List<PokemonTypeEntity>
            {
                new PokemonTypeEntity { Name = "Normal", Color = "#A8A77A" },
                new PokemonTypeEntity { Name = "Fire", Color = "#EE8130" },
                new PokemonTypeEntity { Name = "Water", Color = "#6390F0" },
                new PokemonTypeEntity { Name = "Electric", Color = "#F7D02C" },
                new PokemonTypeEntity { Name = "Grass", Color = "#7AC74C" },
                new PokemonTypeEntity { Name = "Ice", Color = "#96D9D6" },
                new PokemonTypeEntity { Name = "Fighting", Color = "#C22E28" },
                new PokemonTypeEntity { Name = "Poison", Color = "#A33EA1" },
                new PokemonTypeEntity { Name = "Ground", Color = "#E2BF65" },
                new PokemonTypeEntity { Name = "Flying", Color = "#A98FF3" },
                new PokemonTypeEntity { Name = "Psychic", Color = "#F95587" },
                new PokemonTypeEntity { Name = "Bug", Color = "#A6B91A" },
                new PokemonTypeEntity { Name = "Rock", Color = "#B6A136" },
                new PokemonTypeEntity { Name = "Ghost", Color = "#735797" },
                new PokemonTypeEntity { Name = "Dragon", Color = "#6F35FC" },
                new PokemonTypeEntity { Name = "Dark", Color = "#705746" },
                new PokemonTypeEntity { Name = "Steel", Color = "#B7B7CE" },
                new PokemonTypeEntity { Name = "Fairy", Color = "#D685AD" }
            };

            context.PokemonTypes.AddRange(types);
            context.SaveChanges();
        }

        public static void SeedGen1Pokemon(PokemonDbContext context)
        {
            // Error Fix: In-update to 'context.Pokemons' (may 's' base sa DbContext)
            if (context.Pokemons.Any())
            {
                return;
            }

            var pokemonList = new List<Pokemon>
            {
                new Pokemon
                {
                    PokedexNumber = 1,
                    Name = "Bulbasaur",
                    // NOTE: Kung ang 'Types' property sa Pokemon model ay List<PokemonTypeEntity>, 
                    // kailangan mo itong i-map. Pero kung string list ito, okay na 'to.
                    ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
                    Generation = 1
                },
                new Pokemon
                {
                    PokedexNumber = 4,
                    Name = "Charmander",
                    ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
                    Generation = 1
                }
                // Nag-simplify ako ng list para hindi masyadong mahaba ang code rito
            };

            context.Pokemons.AddRange(pokemonList);
            context.SaveChanges();
        }
    }
}