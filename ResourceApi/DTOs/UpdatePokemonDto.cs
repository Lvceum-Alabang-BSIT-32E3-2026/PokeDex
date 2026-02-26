using System.Collections.Generic;

namespace ResourceApi.DTOs;

public class UpdatePokemonDto
{
    public string? Name { get; set; }
    public List<string>? Types { get; set; }
    public int? HP { get; set; }
    public int? Attack { get; set; }
    public int? Defense { get; set; }
    public int? SpecialAttack { get; set; }
    public int? SpecialDefense { get; set; }
    public int? Speed { get; set; }
    public decimal? Height { get; set; }
    public decimal? Weight { get; set; }
    public string? ImageUrl { get; set; }
    public int? Generation { get; set; }
    public bool? IsLegendary { get; set; }
    public bool? IsMythical { get; set; }
}