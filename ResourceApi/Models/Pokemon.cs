using System.Collections.Generic;

namespace ResourceApi.Models;

public class Pokemon
{
    public int Id { get; set; }
    public int PokedexNumber { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public int Generation { get; set; }
    public bool IsLegendary { get; set; }
    public bool IsMythical { get; set; }

    // Task 2.3.2 Requirements
    public int BaseExperience { get; set; }
    public decimal Height { get; set; } // in meters
    public decimal Weight { get; set; } // in kg

    // --- Task 2.1.4: Many-to-Many Relationship ---
    // Ito ang navigation property na gagamitin para sa Join Table
    public ICollection<PokemonType> PokemonTypes { get; set; } = new List<PokemonType>();
}