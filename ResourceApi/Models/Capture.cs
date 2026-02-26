using System;
using System.ComponentModel.DataAnnotations;

namespace ResourceApi.Models
{
    public class Capture
    {
        public int Id { get; set; }
        public int PokemonId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public DateTime CapturedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public virtual Pokemon Pokemon { get; set; } = null!;
    }
}
