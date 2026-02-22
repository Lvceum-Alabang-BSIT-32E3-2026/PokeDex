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
            // TAMA: Gagamit tayo ng PokemonTypeEntity para sa master list
            if (context.PokemonTypes.Any()) return;

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
            // FIX CS1061: context.Pokemons (may 's')
            if (context.Pokemons.Any()) return;

            // Kunin natin ang lahat ng types sa DB para pang-link
            var allTypes = context.PokemonTypes.ToList();

            var bulbasaur = new Pokemon
            {
                PokedexNumber = 1,
                Name = "Bulbasaur",
                ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
                Generation = 1,
                // FIX CS0117: Gamitin ang PokemonTypes (Join Table list)
                PokemonTypes = new List<PokemonType>()
            };

            // Pag-link ng Types (Many-to-Many logic)
            var grassType = allTypes.First(t => t.Name == "Grass");
            var poisonType = allTypes.First(t => t.Name == "Poison");

            bulbasaur.PokemonTypes.Add(new PokemonType { Pokemon = bulbasaur, Type = grassType, IsPrimary = true });
            bulbasaur.PokemonTypes.Add(new PokemonType { Pokemon = bulbasaur, Type = poisonType, IsPrimary = false });

            context.Pokemons.Add(bulbasaur);

            // Gawin ang parehong logic para sa Charmander
            var charmander = new Pokemon
            {
                PokedexNumber = 4,
                Name = "Charmander",
                ImageUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png",
                Generation = 1,
                PokemonTypes = new List<PokemonType>()
            };

            var fireType = allTypes.First(t => t.Name == "Fire");
            charmander.PokemonTypes.Add(new PokemonType { Pokemon = charmander, Type = fireType, IsPrimary = true });

            context.Pokemons.Add(charmander);

            context.SaveChanges();
        }
    }
}