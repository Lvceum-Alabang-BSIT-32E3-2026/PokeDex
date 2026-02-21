using System.Collections.Generic;

namespace ResourceApi.Models;

public class PokemonType
{
	public int Id { get; set; }
	public string Name { get; set; } = string.Empty;

	// Navigation property para bumalik sa Pokemon
	public ICollection<Pokemon> Pokemons { get; set; } = new List<Pokemon>();
}