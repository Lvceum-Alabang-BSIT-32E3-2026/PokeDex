using System.ComponentModel.DataAnnotations;

namespace IdentityServerApi.DTOs
{
    public class UpdateProfileDto
    {
        [Required]
        public string Email { get; set; }

        [Required]
        [StringLength(50)] // Per Task 1.4.1 requirements
        public string DisplayName { get; set; }
    }
}