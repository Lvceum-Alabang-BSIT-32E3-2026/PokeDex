namespace ResourceApi.DTOs
{
    public class PokemonListDto
    {
        public List<PokemonDto> Items { get; set; } = new List<PokemonDto>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
}
