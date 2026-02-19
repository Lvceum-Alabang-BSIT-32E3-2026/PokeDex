namespace PokeDex_Api.Models;

public class Pokemon
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;

    // Navigation property
    public ICollection<Capture> Captures { get; set; } = new List<Capture>();
}
