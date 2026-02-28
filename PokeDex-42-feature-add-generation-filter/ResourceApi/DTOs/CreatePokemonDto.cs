using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ResourceApi.DTOs;

public class CreatePokemonDto
{
    [Required]
    public string Name { get; set; } = string.Empty;
    [Required]
    public List<string> Types { get; set; } = new();
    public string ImageUrl { get; set; } = string.Empty;
    public int Generation { get; set; } = 1;
    public bool IsLegendary { get; set; }
    public bool IsMythical { get; set; }
}