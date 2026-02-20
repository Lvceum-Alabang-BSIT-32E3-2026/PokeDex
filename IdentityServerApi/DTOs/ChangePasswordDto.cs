using System.ComponentModel.DataAnnotations;

namespace IdentityServerApi.DTOs
{
    public class ChangePasswordDto
    {
        [Required]
        public string CurrentPassword { get; set; }

        [Required]
        [MinLength(8)] // Updated from 6 to 8 to match Program.cs config
        public string NewPassword { get; set; }
    }
}
