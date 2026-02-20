using System.ComponentModel.DataAnnotations;

namespace IdentityServerApi.DTOs
{
    public class UpdateProfileDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(100)]
        public string FullName { get; set; }

        // Maaari mong dagdagan base sa user properties niyo
        public string? PhoneNumber { get; set; }
    }
}