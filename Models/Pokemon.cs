namespace ResourceApi.Models
{
    public class Pokemon
    {
        public int Id { get; set; }
        public int PokedexNumber { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public int Generation { get; set; } // DAPAT INT
        public bool IsLegendary { get; set; }
        public bool IsMythical { get; set; }
        
        // Navigation property
        public ICollection<PokemonType> PokemonTypes { get; set; } = new List<PokemonType>();
    }
}