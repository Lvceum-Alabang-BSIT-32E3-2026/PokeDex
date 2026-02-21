using System.Collections.Generic;

namespace ResourceApi.Models;

public class PokemonType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    // DAGDAG MO ITONG LINE NA ITO:
    public string Color { get; set; } = string.Empty;

    public ICollection<Pokemon> Pokemons { get; set; } = new List<Pokemon>();
}