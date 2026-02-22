namespace ResourceApi.Models;

public class PokemonTypeEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty; // Nilagyan ng default para mawala ang warning
    public string Color { get; set; } = string.Empty;
}