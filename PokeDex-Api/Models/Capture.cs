namespace PokeDex_Api.Models;

public class Capture
{
    public int Id { get; set; }
    public string UserId { get; set; } = string.Empty; // From JWT
    public int PokemonId { get; set; }
    public DateTime CapturedAt { get; set; } = DateTime.UtcNow;

    // Navigation property
    public Pokemon Pokemon { get; set; } = null!;
}
