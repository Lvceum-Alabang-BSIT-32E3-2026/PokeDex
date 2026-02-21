namespace ResourceApi.Models
{
    public class PokemonTypeEntity
    {
        public int Id { get; set; }
        public required string Name { get; set; } // Required para sa CS8618
        public required string Color { get; set; } // Required para sa CS8618
    }
}