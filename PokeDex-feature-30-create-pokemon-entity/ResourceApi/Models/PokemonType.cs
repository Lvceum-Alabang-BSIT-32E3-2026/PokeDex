namespace ResourceApi.Models
{
	public class PokemonType
	{
		public int Id { get; set; }

		// The name of the type (e.g., "Fire", "Water")
		public string Name { get; set; } = string.Empty;

		// Navigation property back to Pokemon (if needed)
		public ICollection<Pokemon> Pokemons { get; set; } = new List<Pokemon>();
	}
}