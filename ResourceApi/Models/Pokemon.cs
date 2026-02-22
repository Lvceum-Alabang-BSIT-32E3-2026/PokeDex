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

    // Add this if you still need 'BaseExperience' from the second block
    public int BaseExperience { get; set; }

    // Task 2.3.2 Requirements
    public decimal Height { get; set; } // in meters
    public decimal Weight { get; set; } // in kg

    // Navigation property
    // Make sure the class 'PokemonType' is defined elsewhere in your project!
    // Sa loob ng Pokemon class
    public ICollection<PokemonType> PokemonTypes { get; set; } = new List<PokemonType>();
}