using ResourceApi.Data;
using ResourceApi.Models;
using System.Collections.Generic;
using System.Linq;

namespace ResourceApi.DATA
{
    public static class SeedData
    {
        public static void SeedPokemonTypes(PokemonDbContext context)
        {
            // Iwas duplicates: Titigil ang code dito kung may laman na ang database
            if (context.PokemonTypes.Any())
            {
                return;
            }

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
    }
}