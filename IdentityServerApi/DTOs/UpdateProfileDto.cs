using System.ComponentModel.DataAnnotations;

namespace IdentityServerApi.DTOs
{
    public class UpdateProfileDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(50)]
        public string DisplayName { get; set; }

        // Maaari mong dagdagan base sa user properties niyo
        public string? PhoneNumber { get; set; }
    }
}