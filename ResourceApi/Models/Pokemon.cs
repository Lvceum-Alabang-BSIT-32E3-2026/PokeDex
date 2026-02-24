using System.Collections.Generic;

namespace ResourceApi.Models
{
    public class Pokemon
    {
        // Primary Key
        public int Id { get; set; }

        // Identification Properties (Required by Task 2.1.2)
        public int PokedexNumber { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string Generation { get; set; } = string.Empty;
        public bool IsLegendary { get; set; }
        public bool IsMythical { get; set; }

        // --- BASE STATS (The missing requirement) ---
        public int HP { get; set; }
        public int Attack { get; set; }
        public int Defense { get; set; }
        public int SpecialAttack { get; set; }
        public int SpecialDefense { get; set; }
        public int Speed { get; set; }

        // Navigation property (Optional, but good to have)
        public ICollection<PokemonType> PokemonTypes { get; set; } = new List<PokemonType>();
    }
}