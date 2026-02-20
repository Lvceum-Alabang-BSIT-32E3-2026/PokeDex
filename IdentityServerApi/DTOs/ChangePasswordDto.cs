public class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; }

    [Required]
    [MinLength(6)] // Or whatever your complexity rules require
    public string NewPassword { get; set; }
}