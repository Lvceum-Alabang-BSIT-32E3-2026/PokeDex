namespace ResourceApi.Models;

public class PokemonTypeEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty; // Siguraduhing nandidito ito

    public ICollection<PokemonType> PokemonTypes { get; set; } = new List<PokemonType>();
}