using System.ComponentModel.DataAnnotations;

namespace IdentityServerApi.DTOs
{
    public class UpdateProfileDto
    {
        [Required] // Requirement: Validate input
        public string DisplayName { get; set; }
    }
}