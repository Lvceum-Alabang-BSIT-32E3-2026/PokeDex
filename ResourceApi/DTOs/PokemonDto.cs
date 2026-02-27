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

        public int HP { get; set; }
        public int Attack { get; set; }
        public int Defense { get; set; }
        public int SpecialAttack { get; set; }
        public int SpecialDefense { get; set; }
        public int Speed { get; set; }

        public decimal Height { get; set; }
        public decimal Weight { get; set; }
        public bool IsCaptured { get; set; }
    }
}
