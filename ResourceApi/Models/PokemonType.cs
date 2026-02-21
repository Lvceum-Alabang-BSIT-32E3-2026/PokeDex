namespace ResourceApi.Models;

public class PokemonType // Ito ang link table
{
    public int PokemonId { get; set; }
    public Pokemon Pokemon { get; set; } = null!;

    public int TypeId { get; set; }
    public PokemonTypeEntity Type { get; set; } = null!; // Navigation pabalik sa Entity

    public bool IsPrimary { get; set; }
}