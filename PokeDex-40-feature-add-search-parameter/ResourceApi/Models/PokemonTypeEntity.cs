// ResourceApi/Models/PokemonTypeEntity.cs
namespace ResourceApi.Models;

public class PokemonTypeEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;

    // Navigation property back to the join table
    public ICollection<PokemonType> PokemonTypes { get; set; } = new List<PokemonType>();
}