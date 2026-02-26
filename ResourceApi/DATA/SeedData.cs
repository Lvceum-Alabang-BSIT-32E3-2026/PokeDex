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
            context.Database.EnsureCreated();

            if (context.Pokemons.Any())
            {
                return;
            }

            // Task 2.1.9 Requirement: Seed all 18 types
            var typesList = new Dictionary<string, string>
            {
                { "Normal", "#A8A77A" }, { "Fire", "#EE8130" }, { "Water", "#6390F0" },
                { "Electric", "#F7D02C" }, { "Grass", "#7AC74C" }, { "Ice", "#96D9D6" },
                { "Fighting", "#C22E28" }, { "Poison", "#A33EA1" }, { "Ground", "#E2BF65" },
                { "Flying", "#A98FF3" }, { "Psychic", "#F95587" }, { "Bug", "#A6B91A" },
                { "Rock", "#B6A136" }, { "Ghost", "#735797" }, { "Dragon", "#6F35FC" },
                { "Dark", "#705746" }, { "Steel", "#B7B7CE" }, { "Fairy", "#D685AD" }
            };

            foreach (var type in typesList)
            {
                context.PokemonTypeEntities.Add(new PokemonTypeEntity { Name = type.Key, Color = type.Value });
            }
            context.SaveChanges();

            var allTypes = context.PokemonTypeEntities.ToDictionary(t => t.Name, t => t.Id);

            // Task 2.1.8 & 2.3.3 Requirements: Seed 151 Pokemon with Stats
            for (int i = 1; i <= 151; i++)
            {
                var stats = GetPokemonStats(i);
                var pokemon = new Pokemon
                {
                    PokedexNumber = i,
                    Name = stats.Name,
                    ImageUrl = $"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{i}.png",
                    Generation = 1,
                    IsLegendary = i == 144 || i == 145 || i == 146 || i == 150,
                    IsMythical = i == 151,
                    HP = stats.HP,
                    Attack = stats.Attack,
                    Defense = stats.Defense,
                    SpecialAttack = stats.SpecialAttack,
                    SpecialDefense = stats.SpecialDefense,
                    Speed = stats.Speed,
                    Height = stats.Height,
                    Weight = stats.Weight,
                    BaseExperience = stats.BaseExperience
                };

                context.Pokemons.Add(pokemon);
                context.SaveChanges(); // Save to get Id

                // Link to Types
                var pTypes = GetTypeNames(i);
                for (int j = 0; j < pTypes.Count; j++)
                {
                    if (allTypes.TryGetValue(pTypes[j], out int typeId))
                    {
                        context.PokemonTypes.Add(new PokemonType
                        {
                            PokemonId = pokemon.Id,
                            TypeId = typeId,
                            IsPrimary = j == 0
                        });
                    }
                }
            }

            context.SaveChanges();
        }

        private class PokemonSeedStats
        {
            public string Name { get; set; } = string.Empty;
            public int HP { get; set; }
            public int Attack { get; set; }
            public int Defense { get; set; }
            public int SpecialAttack { get; set; }
            public int SpecialDefense { get; set; }
            public int Speed { get; set; }
            public decimal Height { get; set; }
            public decimal Weight { get; set; }
            public int BaseExperience { get; set; }
        }

        private static PokemonSeedStats GetPokemonStats(int id)
        {
            return id switch
            {
                1 => new PokemonSeedStats { Name = "Bulbasaur", HP = 45, Attack = 49, Defense = 49, SpecialAttack = 65, SpecialDefense = 65, Speed = 45, Height = 0.7m, Weight = 6.9m, BaseExperience = 64 },
                2 => new PokemonSeedStats { Name = "Ivysaur", HP = 60, Attack = 62, Defense = 63, SpecialAttack = 80, SpecialDefense = 80, Speed = 60, Height = 1.0m, Weight = 13.0m, BaseExperience = 142 },
                3 => new PokemonSeedStats { Name = "Venusaur", HP = 80, Attack = 82, Defense = 83, SpecialAttack = 100, SpecialDefense = 100, Speed = 80, Height = 2.0m, Weight = 100.0m, BaseExperience = 236 },
                4 => new PokemonSeedStats { Name = "Charmander", HP = 39, Attack = 52, Defense = 43, SpecialAttack = 60, SpecialDefense = 50, Speed = 65, Height = 0.6m, Weight = 8.5m, BaseExperience = 62 },
                5 => new PokemonSeedStats { Name = "Charmeleon", HP = 58, Attack = 64, Defense = 58, SpecialAttack = 80, SpecialDefense = 65, Speed = 80, Height = 1.1m, Weight = 19.0m, BaseExperience = 142 },
                6 => new PokemonSeedStats { Name = "Charizard", HP = 78, Attack = 84, Defense = 78, SpecialAttack = 109, SpecialDefense = 85, Speed = 100, Height = 1.7m, Weight = 90.5m, BaseExperience = 240 },
                7 => new PokemonSeedStats { Name = "Squirtle", HP = 44, Attack = 48, Defense = 65, SpecialAttack = 50, SpecialDefense = 64, Speed = 43, Height = 0.5m, Weight = 9.0m, BaseExperience = 63 },
                8 => new PokemonSeedStats { Name = "Wartortle", HP = 59, Attack = 63, Defense = 80, SpecialAttack = 65, SpecialDefense = 80, Speed = 58, Height = 1.0m, Weight = 22.5m, BaseExperience = 142 },
                9 => new PokemonSeedStats { Name = "Blastoise", HP = 79, Attack = 83, Defense = 100, SpecialAttack = 85, SpecialDefense = 105, Speed = 78, Height = 1.6m, Weight = 85.5m, BaseExperience = 239 },
                10 => new PokemonSeedStats { Name = "Caterpie", HP = 45, Attack = 30, Defense = 35, SpecialAttack = 20, SpecialDefense = 20, Speed = 45, Height = 0.3m, Weight = 2.9m, BaseExperience = 39 },
                11 => new PokemonSeedStats { Name = "Metapod", HP = 50, Attack = 20, Defense = 55, SpecialAttack = 25, SpecialDefense = 25, Speed = 30, Height = 0.7m, Weight = 9.9m, BaseExperience = 72 },
                12 => new PokemonSeedStats { Name = "Butterfree", HP = 60, Attack = 45, Defense = 50, SpecialAttack = 90, SpecialDefense = 80, Speed = 70, Height = 1.1m, Weight = 32.0m, BaseExperience = 178 },
                13 => new PokemonSeedStats { Name = "Weedle", HP = 40, Attack = 35, Defense = 30, SpecialAttack = 20, SpecialDefense = 20, Speed = 50, Height = 0.3m, Weight = 3.2m, BaseExperience = 39 },
                14 => new PokemonSeedStats { Name = "Kakuna", HP = 45, Attack = 25, Defense = 50, SpecialAttack = 25, SpecialDefense = 25, Speed = 35, Height = 0.6m, Weight = 10.0m, BaseExperience = 72 },
                15 => new PokemonSeedStats { Name = "Beedrill", HP = 65, Attack = 90, Defense = 40, SpecialAttack = 45, SpecialDefense = 80, Speed = 75, Height = 1.0m, Weight = 29.5m, BaseExperience = 178 },
                16 => new PokemonSeedStats { Name = "Pidgey", HP = 40, Attack = 45, Defense = 40, SpecialAttack = 35, SpecialDefense = 35, Speed = 56, Height = 0.3m, Weight = 1.8m, BaseExperience = 50 },
                17 => new PokemonSeedStats { Name = "Pidgeotto", HP = 63, Attack = 60, Defense = 55, SpecialAttack = 50, SpecialDefense = 50, Speed = 71, Height = 1.1m, Weight = 30.0m, BaseExperience = 122 },
                18 => new PokemonSeedStats { Name = "Pidgeot", HP = 83, Attack = 80, Defense = 75, SpecialAttack = 70, SpecialDefense = 70, Speed = 101, Height = 1.5m, Weight = 39.5m, BaseExperience = 216 },
                19 => new PokemonSeedStats { Name = "Rattata", HP = 30, Attack = 56, Defense = 35, SpecialAttack = 25, SpecialDefense = 35, Speed = 72, Height = 0.3m, Weight = 3.5m, BaseExperience = 51 },
                20 => new PokemonSeedStats { Name = "Raticate", HP = 55, Attack = 81, Defense = 60, SpecialAttack = 50, SpecialDefense = 70, Speed = 97, Height = 0.7m, Weight = 18.5m, BaseExperience = 145 },
                21 => new PokemonSeedStats { Name = "Spearow", HP = 40, Attack = 60, Defense = 30, SpecialAttack = 31, SpecialDefense = 31, Speed = 70, Height = 0.3m, Weight = 2.0m, BaseExperience = 52 },
                22 => new PokemonSeedStats { Name = "Fearow", HP = 65, Attack = 90, Defense = 65, SpecialAttack = 61, SpecialDefense = 61, Speed = 100, Height = 1.2m, Weight = 38.0m, BaseExperience = 155 },
                23 => new PokemonSeedStats { Name = "Ekans", HP = 35, Attack = 60, Defense = 44, SpecialAttack = 40, SpecialDefense = 54, Speed = 55, Height = 2.0m, Weight = 6.9m, BaseExperience = 58 },
                24 => new PokemonSeedStats { Name = "Arbok", HP = 60, Attack = 95, Defense = 69, SpecialAttack = 65, SpecialDefense = 79, Speed = 80, Height = 3.5m, Weight = 65.0m, BaseExperience = 157 },
                25 => new PokemonSeedStats { Name = "Pikachu", HP = 35, Attack = 55, Defense = 40, SpecialAttack = 50, SpecialDefense = 50, Speed = 90, Height = 0.4m, Weight = 6.0m, BaseExperience = 112 },
                26 => new PokemonSeedStats { Name = "Raichu", HP = 60, Attack = 90, Defense = 55, SpecialAttack = 90, SpecialDefense = 80, Speed = 110, Height = 0.8m, Weight = 30.0m, BaseExperience = 218 },
                27 => new PokemonSeedStats { Name = "Sandshrew", HP = 50, Attack = 75, Defense = 85, SpecialAttack = 20, SpecialDefense = 30, Speed = 40, Height = 0.6m, Weight = 12.0m, BaseExperience = 60 },
                28 => new PokemonSeedStats { Name = "Sandslash", HP = 75, Attack = 100, Defense = 110, SpecialAttack = 45, SpecialDefense = 55, Speed = 65, Height = 1.0m, Weight = 29.5m, BaseExperience = 158 },
                29 => new PokemonSeedStats { Name = "Nidoran♀", HP = 55, Attack = 47, Defense = 52, SpecialAttack = 40, SpecialDefense = 40, Speed = 41, Height = 0.4m, Weight = 7.0m, BaseExperience = 55 },
                30 => new PokemonSeedStats { Name = "Nidorina", HP = 70, Attack = 62, Defense = 67, SpecialAttack = 55, SpecialDefense = 55, Speed = 56, Height = 0.8m, Weight = 20.0m, BaseExperience = 128 },
                31 => new PokemonSeedStats { Name = "Nidoqueen", HP = 90, Attack = 92, Defense = 87, SpecialAttack = 75, SpecialDefense = 85, Speed = 76, Height = 1.3m, Weight = 60.0m, BaseExperience = 227 },
                32 => new PokemonSeedStats { Name = "Nidoran♂", HP = 46, Attack = 57, Defense = 40, SpecialAttack = 40, SpecialDefense = 40, Speed = 50, Height = 0.5m, Weight = 9.0m, BaseExperience = 55 },
                33 => new PokemonSeedStats { Name = "Nidorino", HP = 61, Attack = 72, Defense = 57, SpecialAttack = 55, SpecialDefense = 55, Speed = 65, Height = 0.9m, Weight = 19.5m, BaseExperience = 128 },
                34 => new PokemonSeedStats { Name = "Nidoking", HP = 81, Attack = 102, Defense = 77, SpecialAttack = 85, SpecialDefense = 75, Speed = 85, Height = 1.4m, Weight = 62.0m, BaseExperience = 227 },
                35 => new PokemonSeedStats { Name = "Clefairy", HP = 70, Attack = 45, Defense = 48, SpecialAttack = 60, SpecialDefense = 65, Speed = 35, Height = 0.6m, Weight = 7.5m, BaseExperience = 113 },
                36 => new PokemonSeedStats { Name = "Clefable", HP = 95, Attack = 70, Defense = 73, SpecialAttack = 95, SpecialDefense = 90, Speed = 60, Height = 1.3m, Weight = 40.0m, BaseExperience = 217 },
                37 => new PokemonSeedStats { Name = "Vulpix", HP = 38, Attack = 41, Defense = 40, SpecialAttack = 50, SpecialDefense = 65, Speed = 65, Height = 0.6m, Weight = 9.9m, BaseExperience = 60 },
                38 => new PokemonSeedStats { Name = "Ninetales", HP = 73, Attack = 76, Defense = 75, SpecialAttack = 81, SpecialDefense = 100, Speed = 100, Height = 1.1m, Weight = 19.9m, BaseExperience = 177 },
                39 => new PokemonSeedStats { Name = "Jigglypuff", HP = 115, Attack = 45, Defense = 20, SpecialAttack = 45, SpecialDefense = 25, Speed = 20, Height = 0.5m, Weight = 5.5m, BaseExperience = 95 },
                40 => new PokemonSeedStats { Name = "Wigglytuff", HP = 140, Attack = 70, Defense = 45, SpecialAttack = 85, SpecialDefense = 50, Speed = 45, Height = 1.0m, Weight = 12.0m, BaseExperience = 196 },
                41 => new PokemonSeedStats { Name = "Zubat", HP = 40, Attack = 45, Defense = 35, SpecialAttack = 30, SpecialDefense = 40, Speed = 55, Height = 0.8m, Weight = 7.5m, BaseExperience = 49 },
                42 => new PokemonSeedStats { Name = "Golbat", HP = 75, Attack = 80, Defense = 70, SpecialAttack = 65, SpecialDefense = 75, Speed = 90, Height = 1.6m, Weight = 55.0m, BaseExperience = 159 },
                43 => new PokemonSeedStats { Name = "Oddish", HP = 45, Attack = 50, Defense = 55, SpecialAttack = 75, SpecialDefense = 65, Speed = 30, Height = 0.5m, Weight = 5.4m, BaseExperience = 64 },
                44 => new PokemonSeedStats { Name = "Gloom", HP = 60, Attack = 65, Defense = 70, SpecialAttack = 85, SpecialDefense = 75, Speed = 40, Height = 0.8m, Weight = 8.6m, BaseExperience = 138 },
                45 => new PokemonSeedStats { Name = "Vileplume", HP = 75, Attack = 80, Defense = 85, SpecialAttack = 110, SpecialDefense = 90, Speed = 50, Height = 1.2m, Weight = 18.6m, BaseExperience = 221 },
                46 => new PokemonSeedStats { Name = "Paras", HP = 35, Attack = 70, Defense = 55, SpecialAttack = 45, SpecialDefense = 55, Speed = 25, Height = 0.3m, Weight = 5.4m, BaseExperience = 57 },
                47 => new PokemonSeedStats { Name = "Parasect", HP = 60, Attack = 95, Defense = 80, SpecialAttack = 60, SpecialDefense = 80, Speed = 30, Height = 1.0m, Weight = 29.5m, BaseExperience = 142 },
                48 => new PokemonSeedStats { Name = "Venonat", HP = 60, Attack = 55, Defense = 50, SpecialAttack = 40, SpecialDefense = 55, Speed = 45, Height = 1.0m, Weight = 30.0m, BaseExperience = 61 },
                49 => new PokemonSeedStats { Name = "Venomoth", HP = 70, Attack = 65, Defense = 60, SpecialAttack = 90, SpecialDefense = 75, Speed = 90, Height = 1.5m, Weight = 12.5m, BaseExperience = 162 },
                50 => new PokemonSeedStats { Name = "Diglett", HP = 10, Attack = 55, Defense = 25, SpecialAttack = 35, SpecialDefense = 45, Speed = 95, Height = 0.2m, Weight = 0.8m, BaseExperience = 53 },
                51 => new PokemonSeedStats { Name = "Dugtrio", HP = 35, Attack = 100, Defense = 50, SpecialAttack = 50, SpecialDefense = 70, Speed = 120, Height = 0.7m, Weight = 33.3m, BaseExperience = 149 },
                52 => new PokemonSeedStats { Name = "Meowth", HP = 40, Attack = 45, Defense = 35, SpecialAttack = 40, SpecialDefense = 40, Speed = 90, Height = 0.4m, Weight = 4.2m, BaseExperience = 58 },
                53 => new PokemonSeedStats { Name = "Persian", HP = 65, Attack = 70, Defense = 60, SpecialAttack = 65, SpecialDefense = 65, Speed = 115, Height = 1.0m, Weight = 32.0m, BaseExperience = 154 },
                54 => new PokemonSeedStats { Name = "Psyduck", HP = 50, Attack = 52, Defense = 48, SpecialAttack = 65, SpecialDefense = 50, Speed = 55, Height = 0.8m, Weight = 19.6m, BaseExperience = 64 },
                55 => new PokemonSeedStats { Name = "Golduck", HP = 80, Attack = 82, Defense = 78, SpecialAttack = 95, SpecialDefense = 80, Speed = 85, Height = 1.7m, Weight = 76.6m, BaseExperience = 175 },
                56 => new PokemonSeedStats { Name = "Mankey", HP = 40, Attack = 80, Defense = 35, SpecialAttack = 35, SpecialDefense = 45, Speed = 70, Height = 0.5m, Weight = 28.0m, BaseExperience = 61 },
                57 => new PokemonSeedStats { Name = "Primeape", HP = 65, Attack = 105, Defense = 60, SpecialAttack = 60, SpecialDefense = 70, Speed = 95, Height = 1.0m, Weight = 32.0m, BaseExperience = 159 },
                58 => new PokemonSeedStats { Name = "Growlithe", HP = 55, Attack = 70, Defense = 45, SpecialAttack = 70, SpecialDefense = 50, Speed = 60, Height = 0.7m, Weight = 19.0m, BaseExperience = 70 },
                59 => new PokemonSeedStats { Name = "Arcanine", HP = 90, Attack = 110, Defense = 80, SpecialAttack = 100, SpecialDefense = 80, Speed = 95, Height = 1.9m, Weight = 155.0m, BaseExperience = 216 },
                60 => new PokemonSeedStats { Name = "Poliwag", HP = 40, Attack = 50, Defense = 40, SpecialAttack = 40, SpecialDefense = 40, Speed = 90, Height = 0.6m, Weight = 12.4m, BaseExperience = 60 },
                61 => new PokemonSeedStats { Name = "Poliwhirl", HP = 65, Attack = 65, Defense = 65, SpecialAttack = 50, SpecialDefense = 50, Speed = 90, Height = 1.0m, Weight = 20.0m, BaseExperience = 135 },
                62 => new PokemonSeedStats { Name = "Poliwrath", HP = 90, Attack = 95, Defense = 95, SpecialAttack = 70, SpecialDefense = 90, Speed = 70, Height = 1.3m, Weight = 54.0m, BaseExperience = 230 },
                63 => new PokemonSeedStats { Name = "Abra", HP = 25, Attack = 20, Defense = 15, SpecialAttack = 105, SpecialDefense = 55, Speed = 90, Height = 0.9m, Weight = 19.5m, BaseExperience = 62 },
                64 => new PokemonSeedStats { Name = "Kadabra", HP = 40, Attack = 35, Defense = 30, SpecialAttack = 120, SpecialDefense = 70, Speed = 105, Height = 1.3m, Weight = 56.5m, BaseExperience = 140 },
                65 => new PokemonSeedStats { Name = "Alakazam", HP = 55, Attack = 50, Defense = 45, SpecialAttack = 135, SpecialDefense = 95, Speed = 120, Height = 1.5m, Weight = 48.0m, BaseExperience = 225 },
                66 => new PokemonSeedStats { Name = "Machop", HP = 70, Attack = 80, Defense = 50, SpecialAttack = 35, SpecialDefense = 35, Speed = 35, Height = 0.8m, Weight = 19.5m, BaseExperience = 61 },
                67 => new PokemonSeedStats { Name = "Machoke", HP = 80, Attack = 100, Defense = 70, SpecialAttack = 50, SpecialDefense = 60, Speed = 45, Height = 1.5m, Weight = 70.5m, BaseExperience = 142 },
                68 => new PokemonSeedStats { Name = "Machamp", HP = 90, Attack = 130, Defense = 80, SpecialAttack = 65, SpecialDefense = 85, Speed = 55, Height = 1.6m, Weight = 130.0m, BaseExperience = 227 },
                69 => new PokemonSeedStats { Name = "Bellsprout", HP = 50, Attack = 75, Defense = 35, SpecialAttack = 70, SpecialDefense = 30, Speed = 40, Height = 0.7m, Weight = 4.0m, BaseExperience = 60 },
                70 => new PokemonSeedStats { Name = "Weepinbell", HP = 65, Attack = 90, Defense = 50, SpecialAttack = 85, SpecialDefense = 45, Speed = 55, Height = 1.0m, Weight = 6.4m, BaseExperience = 137 },
                71 => new PokemonSeedStats { Name = "Victreebel", HP = 80, Attack = 105, Defense = 65, SpecialAttack = 100, SpecialDefense = 70, Speed = 70, Height = 1.7m, Weight = 15.5m, BaseExperience = 221 },
                72 => new PokemonSeedStats { Name = "Tentacool", HP = 40, Attack = 40, Defense = 35, SpecialAttack = 50, SpecialDefense = 100, Speed = 70, Height = 0.9m, Weight = 45.5m, BaseExperience = 67 },
                73 => new PokemonSeedStats { Name = "Tentacruel", HP = 80, Attack = 70, Defense = 65, SpecialAttack = 80, SpecialDefense = 120, Speed = 100, Height = 1.6m, Weight = 55.0m, BaseExperience = 180 },
                74 => new PokemonSeedStats { Name = "Geodude", HP = 40, Attack = 80, Defense = 100, SpecialAttack = 30, SpecialDefense = 30, Speed = 20, Height = 0.4m, Weight = 20.0m, BaseExperience = 60 },
                75 => new PokemonSeedStats { Name = "Graveler", HP = 55, Attack = 95, Defense = 115, SpecialAttack = 45, SpecialDefense = 45, Speed = 35, Height = 1.0m, Weight = 105.0m, BaseExperience = 137 },
                76 => new PokemonSeedStats { Name = "Golem", HP = 80, Attack = 120, Defense = 130, SpecialAttack = 55, SpecialDefense = 65, Speed = 45, Height = 1.4m, Weight = 300.0m, BaseExperience = 223 },
                77 => new PokemonSeedStats { Name = "Ponyta", HP = 50, Attack = 85, Defense = 55, SpecialAttack = 65, SpecialDefense = 65, Speed = 90, Height = 1.0m, Weight = 30.0m, BaseExperience = 82 },
                78 => new PokemonSeedStats { Name = "Rapidash", HP = 65, Attack = 100, Defense = 70, SpecialAttack = 80, SpecialDefense = 80, Speed = 105, Height = 1.7m, Weight = 95.0m, BaseExperience = 175 },
                79 => new PokemonSeedStats { Name = "Slowpoke", HP = 90, Attack = 65, Defense = 65, SpecialAttack = 40, SpecialDefense = 40, Speed = 15, Height = 1.2m, Weight = 36.0m, BaseExperience = 63 },
                80 => new PokemonSeedStats { Name = "Slowbro", HP = 95, Attack = 75, Defense = 110, SpecialAttack = 100, SpecialDefense = 80, Speed = 30, Height = 1.6m, Weight = 78.5m, BaseExperience = 172 },
                81 => new PokemonSeedStats { Name = "Magnemite", HP = 25, Attack = 35, Defense = 70, SpecialAttack = 95, SpecialDefense = 55, Speed = 45, Height = 0.3m, Weight = 6.0m, BaseExperience = 65 },
                82 => new PokemonSeedStats { Name = "Magneton", HP = 50, Attack = 60, Defense = 95, SpecialAttack = 120, SpecialDefense = 70, Speed = 70, Height = 1.0m, Weight = 60.0m, BaseExperience = 163 },
                83 => new PokemonSeedStats { Name = "Farfetch'd", HP = 52, Attack = 90, Defense = 55, SpecialAttack = 58, SpecialDefense = 62, Speed = 60, Height = 0.8m, Weight = 15.0m, BaseExperience = 132 },
                84 => new PokemonSeedStats { Name = "Doduo", HP = 35, Attack = 85, Defense = 45, SpecialAttack = 35, SpecialDefense = 35, Speed = 75, Height = 1.4m, Weight = 39.2m, BaseExperience = 62 },
                85 => new PokemonSeedStats { Name = "Dodrio", HP = 60, Attack = 110, Defense = 70, SpecialAttack = 60, SpecialDefense = 60, Speed = 100, Height = 1.8m, Weight = 85.2m, BaseExperience = 165 },
                86 => new PokemonSeedStats { Name = "Seel", HP = 65, Attack = 45, Defense = 55, SpecialAttack = 45, SpecialDefense = 70, Speed = 45, Height = 1.1m, Weight = 90.0m, BaseExperience = 65 },
                87 => new PokemonSeedStats { Name = "Dewgong", HP = 90, Attack = 70, Defense = 80, SpecialAttack = 70, SpecialDefense = 95, Speed = 70, Height = 1.7m, Weight = 120.0m, BaseExperience = 166 },
                88 => new PokemonSeedStats { Name = "Grimer", HP = 80, Attack = 80, Defense = 50, SpecialAttack = 40, SpecialDefense = 50, Speed = 25, Height = 0.9m, Weight = 30.0m, BaseExperience = 65 },
                89 => new PokemonSeedStats { Name = "Muk", HP = 105, Attack = 105, Defense = 75, SpecialAttack = 65, SpecialDefense = 100, Speed = 50, Height = 1.2m, Weight = 30.0m, BaseExperience = 157 },
                90 => new PokemonSeedStats { Name = "Shellder", HP = 30, Attack = 65, Defense = 100, SpecialAttack = 45, SpecialDefense = 25, Speed = 40, Height = 0.3m, Weight = 4.0m, BaseExperience = 61 },
                91 => new PokemonSeedStats { Name = "Cloyster", HP = 50, Attack = 95, Defense = 180, SpecialAttack = 85, SpecialDefense = 45, Speed = 70, Height = 1.5m, Weight = 132.5m, BaseExperience = 184 },
                92 => new PokemonSeedStats { Name = "Gastly", HP = 30, Attack = 35, Defense = 30, SpecialAttack = 100, SpecialDefense = 35, Speed = 80, Height = 1.3m, Weight = 0.1m, BaseExperience = 62 },
                93 => new PokemonSeedStats { Name = "Haunter", HP = 45, Attack = 50, Defense = 45, SpecialAttack = 115, SpecialDefense = 55, Speed = 95, Height = 1.6m, Weight = 0.1m, BaseExperience = 142 },
                94 => new PokemonSeedStats { Name = "Gengar", HP = 60, Attack = 65, Defense = 60, SpecialAttack = 130, SpecialDefense = 75, Speed = 110, Height = 1.5m, Weight = 40.5m, BaseExperience = 225 },
                95 => new PokemonSeedStats { Name = "Onix", HP = 35, Attack = 45, Defense = 160, SpecialAttack = 30, SpecialDefense = 45, Speed = 70, Height = 8.8m, Weight = 210.0m, BaseExperience = 77 },
                96 => new PokemonSeedStats { Name = "Drowzee", HP = 60, Attack = 48, Defense = 45, SpecialAttack = 43, SpecialDefense = 90, Speed = 42, Height = 1.0m, Weight = 32.4m, BaseExperience = 66 },
                97 => new PokemonSeedStats { Name = "Hypno", HP = 85, Attack = 73, Defense = 70, SpecialAttack = 73, SpecialDefense = 115, Speed = 67, Height = 1.6m, Weight = 75.6m, BaseExperience = 169 },
                98 => new PokemonSeedStats { Name = "Krabby", HP = 30, Attack = 105, Defense = 90, SpecialAttack = 25, SpecialDefense = 25, Speed = 50, Height = 0.4m, Weight = 6.5m, BaseExperience = 65 },
                99 => new PokemonSeedStats { Name = "Kingler", HP = 55, Attack = 130, Defense = 115, SpecialAttack = 50, SpecialDefense = 50, Speed = 75, Height = 1.3m, Weight = 60.0m, BaseExperience = 166 },
                100 => new PokemonSeedStats { Name = "Voltorb", HP = 40, Attack = 30, Defense = 50, SpecialAttack = 55, SpecialDefense = 55, Speed = 100, Height = 0.5m, Weight = 10.4m, BaseExperience = 66 },
                101 => new PokemonSeedStats { Name = "Electrode", HP = 60, Attack = 50, Defense = 70, SpecialAttack = 80, SpecialDefense = 80, Speed = 150, Height = 1.2m, Weight = 66.6m, BaseExperience = 172 },
                102 => new PokemonSeedStats { Name = "Exeggcute", HP = 60, Attack = 40, Defense = 80, SpecialAttack = 60, SpecialDefense = 45, Speed = 40, Height = 0.4m, Weight = 2.5m, BaseExperience = 65 },
                103 => new PokemonSeedStats { Name = "Exeggutor", HP = 95, Attack = 95, Defense = 85, SpecialAttack = 125, SpecialDefense = 75, Speed = 45, Height = 2.0m, Weight = 120.0m, BaseExperience = 182 },
                104 => new PokemonSeedStats { Name = "Cubone", HP = 50, Attack = 50, Defense = 95, SpecialAttack = 40, SpecialDefense = 50, Speed = 35, Height = 0.4m, Weight = 6.5m, BaseExperience = 64 },
                105 => new PokemonSeedStats { Name = "Marowak", HP = 60, Attack = 80, Defense = 110, SpecialAttack = 50, SpecialDefense = 80, Speed = 45, Height = 1.0m, Weight = 45.0m, BaseExperience = 149 },
                106 => new PokemonSeedStats { Name = "Hitmonlee", HP = 50, Attack = 120, Defense = 53, SpecialAttack = 35, SpecialDefense = 110, Speed = 87, Height = 1.5m, Weight = 49.8m, BaseExperience = 159 },
                107 => new PokemonSeedStats { Name = "Hitmonchan", HP = 50, Attack = 105, Defense = 79, SpecialAttack = 35, SpecialDefense = 110, Speed = 76, Height = 1.4m, Weight = 50.2m, BaseExperience = 159 },
                108 => new PokemonSeedStats { Name = "Lickitung", HP = 90, Attack = 55, Defense = 75, SpecialAttack = 60, SpecialDefense = 75, Speed = 30, Height = 1.2m, Weight = 65.5m, BaseExperience = 77 },
                109 => new PokemonSeedStats { Name = "Koffing", HP = 40, Attack = 65, Defense = 95, SpecialAttack = 60, SpecialDefense = 45, Speed = 35, Height = 0.6m, Weight = 1.0m, BaseExperience = 68 },
                110 => new PokemonSeedStats { Name = "Weezing", HP = 65, Attack = 90, Defense = 120, SpecialAttack = 85, SpecialDefense = 70, Speed = 60, Height = 1.2m, Weight = 9.5m, BaseExperience = 172 },
                111 => new PokemonSeedStats { Name = "Rhyhorn", HP = 80, Attack = 85, Defense = 95, SpecialAttack = 30, SpecialDefense = 30, Speed = 25, Height = 1.0m, Weight = 115.0m, BaseExperience = 69 },
                112 => new PokemonSeedStats { Name = "Rhydon", HP = 105, Attack = 130, Defense = 120, SpecialAttack = 45, SpecialDefense = 45, Speed = 40, Height = 1.9m, Weight = 120.0m, BaseExperience = 170 },
                113 => new PokemonSeedStats { Name = "Chansey", HP = 250, Attack = 5, Defense = 5, SpecialAttack = 35, SpecialDefense = 105, Speed = 50, Height = 1.1m, Weight = 34.6m, BaseExperience = 395 },
                114 => new PokemonSeedStats { Name = "Tangela", HP = 65, Attack = 55, Defense = 115, SpecialAttack = 100, SpecialDefense = 40, Speed = 60, Height = 1.0m, Weight = 35.0m, BaseExperience = 87 },
                115 => new PokemonSeedStats { Name = "Kangaskhan", HP = 105, Attack = 95, Defense = 80, SpecialAttack = 40, SpecialDefense = 80, Speed = 90, Height = 2.2m, Weight = 80.0m, BaseExperience = 172 },
                116 => new PokemonSeedStats { Name = "Horsea", HP = 30, Attack = 40, Defense = 70, SpecialAttack = 70, SpecialDefense = 25, Speed = 60, Height = 0.4m, Weight = 8.0m, BaseExperience = 59 },
                117 => new PokemonSeedStats { Name = "Seadra", HP = 55, Attack = 65, Defense = 95, SpecialAttack = 95, SpecialDefense = 45, Speed = 85, Height = 1.2m, Weight = 25.0m, BaseExperience = 154 },
                118 => new PokemonSeedStats { Name = "Goldeen", HP = 45, Attack = 67, Defense = 60, SpecialAttack = 35, SpecialDefense = 50, Speed = 63, Height = 0.6m, Weight = 15.0m, BaseExperience = 64 },
                119 => new PokemonSeedStats { Name = "Seaking", HP = 80, Attack = 92, Defense = 65, SpecialAttack = 65, SpecialDefense = 80, Speed = 68, Height = 1.3m, Weight = 39.0m, BaseExperience = 158 },
                120 => new PokemonSeedStats { Name = "Staryu", HP = 30, Attack = 45, Defense = 55, SpecialAttack = 70, SpecialDefense = 55, Speed = 85, Height = 0.8m, Weight = 34.5m, BaseExperience = 68 },
                121 => new PokemonSeedStats { Name = "Starmie", HP = 60, Attack = 75, Defense = 85, SpecialAttack = 100, SpecialDefense = 85, Speed = 115, Height = 1.1m, Weight = 80.0m, BaseExperience = 182 },
                122 => new PokemonSeedStats { Name = "Mr. Mime", HP = 40, Attack = 45, Defense = 65, SpecialAttack = 100, SpecialDefense = 120, Speed = 90, Height = 1.3m, Weight = 54.5m, BaseExperience = 161 },
                123 => new PokemonSeedStats { Name = "Scyther", HP = 70, Attack = 110, Defense = 80, SpecialAttack = 55, SpecialDefense = 80, Speed = 105, Height = 1.5m, Weight = 56.0m, BaseExperience = 100 },
                124 => new PokemonSeedStats { Name = "Jynx", HP = 65, Attack = 50, Defense = 35, SpecialAttack = 115, SpecialDefense = 95, Speed = 95, Height = 1.4m, Weight = 40.6m, BaseExperience = 159 },
                125 => new PokemonSeedStats { Name = "Electabuzz", HP = 65, Attack = 83, Defense = 57, SpecialAttack = 95, SpecialDefense = 85, Speed = 105, Height = 1.1m, Weight = 30.0m, BaseExperience = 172 },
                126 => new PokemonSeedStats { Name = "Magmar", HP = 65, Attack = 95, Defense = 57, SpecialAttack = 100, SpecialDefense = 85, Speed = 93, Height = 1.3m, Weight = 44.5m, BaseExperience = 173 },
                127 => new PokemonSeedStats { Name = "Pinsir", HP = 65, Attack = 125, Defense = 100, SpecialAttack = 55, SpecialDefense = 70, Speed = 85, Height = 1.5m, Weight = 55.0m, BaseExperience = 175 },
                128 => new PokemonSeedStats { Name = "Tauros", HP = 75, Attack = 100, Defense = 95, SpecialAttack = 40, SpecialDefense = 70, Speed = 110, Height = 1.4m, Weight = 88.4m, BaseExperience = 172 },
                129 => new PokemonSeedStats { Name = "Magikarp", HP = 20, Attack = 10, Defense = 55, SpecialAttack = 15, SpecialDefense = 20, Speed = 80, Height = 0.9m, Weight = 10.0m, BaseExperience = 40 },
                130 => new PokemonSeedStats { Name = "Gyarados", HP = 95, Attack = 125, Defense = 79, SpecialAttack = 60, SpecialDefense = 100, Speed = 81, Height = 6.5m, Weight = 235.0m, BaseExperience = 189 },
                131 => new PokemonSeedStats { Name = "Lapras", HP = 130, Attack = 85, Defense = 80, SpecialAttack = 85, SpecialDefense = 95, Speed = 60, Height = 2.5m, Weight = 220.0m, BaseExperience = 187 },
                132 => new PokemonSeedStats { Name = "Ditto", HP = 48, Attack = 48, Defense = 48, SpecialAttack = 48, SpecialDefense = 48, Speed = 48, Height = 0.3m, Weight = 4.0m, BaseExperience = 101 },
                133 => new PokemonSeedStats { Name = "Eevee", HP = 55, Attack = 55, Defense = 50, SpecialAttack = 45, SpecialDefense = 65, Speed = 55, Height = 0.3m, Weight = 6.5m, BaseExperience = 65 },
                134 => new PokemonSeedStats { Name = "Vaporeon", HP = 130, Attack = 65, Defense = 60, SpecialAttack = 110, SpecialDefense = 95, Speed = 65, Height = 1.0m, Weight = 29.0m, BaseExperience = 184 },
                135 => new PokemonSeedStats { Name = "Jolteon", HP = 65, Attack = 65, Defense = 60, SpecialAttack = 110, SpecialDefense = 95, Speed = 130, Height = 0.8m, Weight = 24.5m, BaseExperience = 184 },
                136 => new PokemonSeedStats { Name = "Flareon", HP = 65, Attack = 130, Defense = 60, SpecialAttack = 95, SpecialDefense = 110, Speed = 65, Height = 0.9m, Weight = 25.0m, BaseExperience = 184 },
                137 => new PokemonSeedStats { Name = "Porygon", HP = 65, Attack = 60, Defense = 70, SpecialAttack = 85, SpecialDefense = 75, Speed = 40, Height = 0.8m, Weight = 36.5m, BaseExperience = 79 },
                138 => new PokemonSeedStats { Name = "Omanyte", HP = 35, Attack = 40, Defense = 100, SpecialAttack = 90, SpecialDefense = 55, Speed = 35, Height = 0.4m, Weight = 7.5m, BaseExperience = 71 },
                139 => new PokemonSeedStats { Name = "Omastar", HP = 70, Attack = 60, Defense = 125, SpecialAttack = 115, SpecialDefense = 70, Speed = 55, Height = 1.0m, Weight = 35.0m, BaseExperience = 173 },
                140 => new PokemonSeedStats { Name = "Kabuto", HP = 30, Attack = 80, Defense = 90, SpecialAttack = 55, SpecialDefense = 45, Speed = 55, Height = 0.5m, Weight = 11.5m, BaseExperience = 71 },
                141 => new PokemonSeedStats { Name = "Kabutops", HP = 60, Attack = 115, Defense = 105, SpecialAttack = 65, SpecialDefense = 70, Speed = 80, Height = 1.3m, Weight = 40.5m, BaseExperience = 173 },
                142 => new PokemonSeedStats { Name = "Aerodactyl", HP = 80, Attack = 105, Defense = 65, SpecialAttack = 60, SpecialDefense = 75, Speed = 130, Height = 1.8m, Weight = 59.0m, BaseExperience = 180 },
                143 => new PokemonSeedStats { Name = "Snorlax", HP = 160, Attack = 110, Defense = 65, SpecialAttack = 65, SpecialDefense = 110, Speed = 30, Height = 2.1m, Weight = 460.0m, BaseExperience = 189 },
                144 => new PokemonSeedStats { Name = "Articuno", HP = 90, Attack = 85, Defense = 100, SpecialAttack = 95, SpecialDefense = 125, Speed = 85, Height = 1.7m, Weight = 55.4m, BaseExperience = 261 },
                145 => new PokemonSeedStats { Name = "Zapdos", HP = 90, Attack = 90, Defense = 85, SpecialAttack = 125, SpecialDefense = 90, Speed = 100, Height = 1.6m, Weight = 52.6m, BaseExperience = 261 },
                146 => new PokemonSeedStats { Name = "Moltres", HP = 90, Attack = 100, Defense = 90, SpecialAttack = 125, SpecialDefense = 85, Speed = 90, Height = 2.0m, Weight = 60.0m, BaseExperience = 261 },
                147 => new PokemonSeedStats { Name = "Dratini", HP = 41, Attack = 64, Defense = 45, SpecialAttack = 50, SpecialDefense = 50, Speed = 50, Height = 1.8m, Weight = 3.3m, BaseExperience = 60 },
                148 => new PokemonSeedStats { Name = "Dragonair", HP = 61, Attack = 84, Defense = 65, SpecialAttack = 70, SpecialDefense = 70, Speed = 70, Height = 4.0m, Weight = 16.5m, BaseExperience = 147 },
                149 => new PokemonSeedStats { Name = "Dragonite", HP = 91, Attack = 134, Defense = 95, SpecialAttack = 100, SpecialDefense = 100, Speed = 80, Height = 2.2m, Weight = 210.0m, BaseExperience = 270 },
                150 => new PokemonSeedStats { Name = "Mewtwo", HP = 106, Attack = 110, Defense = 90, SpecialAttack = 154, SpecialDefense = 90, Speed = 130, Height = 2.0m, Weight = 122.0m, BaseExperience = 306 },
                151 => new PokemonSeedStats { Name = "Mew", HP = 100, Attack = 100, Defense = 100, SpecialAttack = 100, SpecialDefense = 100, Speed = 100, Height = 0.4m, Weight = 4.0m, BaseExperience = 270 },
                _ => new PokemonSeedStats { Name = $"Pokemon #{id}", HP = 50, Attack = 50, Defense = 50, SpecialAttack = 50, SpecialDefense = 50, Speed = 50, Height = 1.0m, Weight = 20.0m, BaseExperience = 100 }
            };
        }

        private static List<string> GetTypeNames(int id)
        {
            return id switch
            {
                1 => new List<string> { "Grass", "Poison" },
                2 => new List<string> { "Grass", "Poison" },
                3 => new List<string> { "Grass", "Poison" },
                4 => new List<string> { "Fire" },
                5 => new List<string> { "Fire" },
                6 => new List<string> { "Fire", "Flying" },
                7 => new List<string> { "Water" },
                8 => new List<string> { "Water" },
                9 => new List<string> { "Water" },
                10 => new List<string> { "Bug" },
                11 => new List<string> { "Bug" },
                12 => new List<string> { "Bug", "Flying" },
                13 => new List<string> { "Bug", "Poison" },
                14 => new List<string> { "Bug", "Poison" },
                15 => new List<string> { "Bug", "Poison" },
                16 => new List<string> { "Normal", "Flying" },
                17 => new List<string> { "Normal", "Flying" },
                18 => new List<string> { "Normal", "Flying" },
                19 => new List<string> { "Normal" },
                20 => new List<string> { "Normal" },
                21 => new List<string> { "Normal", "Flying" },
                22 => new List<string> { "Normal", "Flying" },
                23 => new List<string> { "Poison" },
                24 => new List<string> { "Poison" },
                25 => new List<string> { "Electric" },
                26 => new List<string> { "Electric" },
                27 => new List<string> { "Ground" },
                28 => new List<string> { "Ground" },
                29 => new List<string> { "Poison" },
                30 => new List<string> { "Poison" },
                31 => new List<string> { "Poison", "Ground" },
                32 => new List<string> { "Poison" },
                33 => new List<string> { "Poison" },
                34 => new List<string> { "Poison", "Ground" },
                35 => new List<string> { "Fairy" },
                36 => new List<string> { "Fairy" },
                37 => new List<string> { "Fire" },
                38 => new List<string> { "Fire" },
                39 => new List<string> { "Normal", "Fairy" },
                40 => new List<string> { "Normal", "Fairy" },
                41 => new List<string> { "Poison", "Flying" },
                42 => new List<string> { "Poison", "Flying" },
                43 => new List<string> { "Grass", "Poison" },
                44 => new List<string> { "Grass", "Poison" },
                45 => new List<string> { "Grass", "Poison" },
                46 => new List<string> { "Bug", "Grass" },
                47 => new List<string> { "Bug", "Grass" },
                48 => new List<string> { "Bug", "Poison" },
                49 => new List<string> { "Bug", "Poison" },
                50 => new List<string> { "Ground" },
                51 => new List<string> { "Ground" },
                52 => new List<string> { "Normal" },
                53 => new List<string> { "Normal" },
                54 => new List<string> { "Water" },
                55 => new List<string> { "Water" },
                56 => new List<string> { "Fighting" },
                57 => new List<string> { "Fighting" },
                58 => new List<string> { "Fire" },
                59 => new List<string> { "Fire" },
                60 => new List<string> { "Water" },
                61 => new List<string> { "Water" },
                62 => new List<string> { "Water", "Fighting" },
                63 => new List<string> { "Psychic" },
                64 => new List<string> { "Psychic" },
                65 => new List<string> { "Psychic" },
                66 => new List<string> { "Fighting" },
                67 => new List<string> { "Fighting" },
                68 => new List<string> { "Fighting" },
                69 => new List<string> { "Grass", "Poison" },
                70 => new List<string> { "Grass", "Poison" },
                71 => new List<string> { "Grass", "Poison" },
                72 => new List<string> { "Water", "Poison" },
                73 => new List<string> { "Water", "Poison" },
                74 => new List<string> { "Rock", "Ground" },
                75 => new List<string> { "Rock", "Ground" },
                76 => new List<string> { "Rock", "Ground" },
                77 => new List<string> { "Fire" },
                78 => new List<string> { "Fire" },
                79 => new List<string> { "Water", "Psychic" },
                80 => new List<string> { "Water", "Psychic" },
                81 => new List<string> { "Electric", "Steel" },
                82 => new List<string> { "Electric", "Steel" },
                83 => new List<string> { "Normal", "Flying" },
                84 => new List<string> { "Normal", "Flying" },
                85 => new List<string> { "Normal", "Flying" },
                86 => new List<string> { "Water" },
                87 => new List<string> { "Water", "Ice" },
                88 => new List<string> { "Poison" },
                89 => new List<string> { "Poison" },
                90 => new List<string> { "Water" },
                91 => new List<string> { "Water", "Ice" },
                92 => new List<string> { "Ghost", "Poison" },
                93 => new List<string> { "Ghost", "Poison" },
                94 => new List<string> { "Ghost", "Poison" },
                95 => new List<string> { "Rock", "Ground" },
                96 => new List<string> { "Psychic" },
                97 => new List<string> { "Psychic" },
                98 => new List<string> { "Water" },
                99 => new List<string> { "Water" },
                100 => new List<string> { "Electric" },
                101 => new List<string> { "Electric" },
                102 => new List<string> { "Grass", "Psychic" },
                103 => new List<string> { "Grass", "Psychic" },
                104 => new List<string> { "Ground" },
                105 => new List<string> { "Ground" },
                106 => new List<string> { "Fighting" },
                107 => new List<string> { "Fighting" },
                108 => new List<string> { "Normal" },
                109 => new List<string> { "Poison" },
                110 => new List<string> { "Poison" },
                111 => new List<string> { "Ground", "Rock" },
                112 => new List<string> { "Ground", "Rock" },
                113 => new List<string> { "Normal" },
                114 => new List<string> { "Grass" },
                115 => new List<string> { "Normal" },
                116 => new List<string> { "Water" },
                117 => new List<string> { "Water" },
                118 => new List<string> { "Water" },
                119 => new List<string> { "Water" },
                120 => new List<string> { "Water" },
                121 => new List<string> { "Water", "Psychic" },
                122 => new List<string> { "Psychic", "Fairy" },
                123 => new List<string> { "Bug", "Flying" },
                124 => new List<string> { "Ice", "Psychic" },
                125 => new List<string> { "Electric" },
                126 => new List<string> { "Fire" },
                127 => new List<string> { "Bug" },
                128 => new List<string> { "Normal" },
                129 => new List<string> { "Water" },
                130 => new List<string> { "Water", "Flying" },
                131 => new List<string> { "Water", "Ice" },
                132 => new List<string> { "Normal" },
                133 => new List<string> { "Normal" },
                134 => new List<string> { "Water" },
                135 => new List<string> { "Electric" },
                136 => new List<string> { "Fire" },
                137 => new List<string> { "Normal" },
                138 => new List<string> { "Rock", "Water" },
                139 => new List<string> { "Rock", "Water" },
                140 => new List<string> { "Rock", "Water" },
                141 => new List<string> { "Rock", "Water" },
                142 => new List<string> { "Rock", "Flying" },
                143 => new List<string> { "Normal" },
                144 => new List<string> { "Ice", "Flying" },
                145 => new List<string> { "Electric", "Flying" },
                146 => new List<string> { "Fire", "Flying" },
                147 => new List<string> { "Dragon" },
                148 => new List<string> { "Dragon" },
                149 => new List<string> { "Dragon", "Flying" },
                150 => new List<string> { "Psychic" },
                151 => new List<string> { "Psychic" },
                _ => new List<string> { "Normal" }
            };
        }
    }
}