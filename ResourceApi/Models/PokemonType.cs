namespace ResourceApi.Models
{
    public class PokemonType
    {
        public int PokemonId { get; set; }
        public Pokemon Pokemon { get; set; }

        public int TypeId { get; set; }
        public PokemonTypeEntity Type { get; set; }

        public bool IsPrimary { get; set; }
    }
}
