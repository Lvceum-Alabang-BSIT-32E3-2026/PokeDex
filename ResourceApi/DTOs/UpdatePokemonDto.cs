using System.Collections.Generic;

namespace ResourceApi.DTOs;

public class UpdatePokemonDto
{
    public string? Name { get; set; }
    public List<string>? Types { get; set; }
    public string? ImageUrl { get; set; }
    public int? Generation { get; set; }
    public bool? IsLegendary { get; set; }
    public bool? IsMythical { get; set; }
}