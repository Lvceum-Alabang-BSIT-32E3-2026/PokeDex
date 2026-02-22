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

    public int BaseExperience { get; set; }

    // Task 2.3.2 Requirements
    public decimal Height { get; set; } // in meters
    public decimal Weight { get; set; } // in kg

    // FIX: Palitan ang PokemonType ng PokemonTypeEntity 
    // at gawin nating 'Types' ang property name para mag-match sa SeedData mo
    public ICollection<PokemonTypeEntity> Types { get; set; } = new List<PokemonTypeEntity>();
}