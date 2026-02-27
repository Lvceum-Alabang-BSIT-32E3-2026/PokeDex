namespace ResourceApi.DTOs
{
    public class PokemonDto
    {
        public int Id { get; set; }
        public int PokedexNumber { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public List<string> Types { get; set; } = new List<string>();
        public int Generation { get; set; }
        public bool IsLegendary { get; set; }
        public bool IsMythical { get; set; }
    }
}
