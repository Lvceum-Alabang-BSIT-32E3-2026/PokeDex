using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ResourceApi.Models
{
    public class Capture
    {
        [Key]
        public int Id { get; set; }

        // UserId from JWT (Identity User Id)
        [Required]
        public string UserId { get; set; }

        [Required]
        public int PokemonId { get; set; }

        public DateTime CapturedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        [ForeignKey(nameof(PokemonId))]
        public Pokemon Pokemon { get; set; }
    }
}