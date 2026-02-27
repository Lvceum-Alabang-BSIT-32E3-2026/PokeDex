using System;

namespace ResourceApi.DTOs
{
    public class CaptureDto
    {
        public int Id { get; set; }
        public int PokemonId { get; set; }
        public string PokemonName { get; set; } = string.Empty;
        public string PokemonImageUrl { get; set; } = string.Empty;
        public DateTime CapturedAt { get; set; }
    }
}
