namespace IdentityServerApi.DTOs
{
    public class TokenResponseDto
    {
        public string Token { get; set; }
        public DateTime Expiration { get; set; }
        public UserResponseDto User { get; set; }
    }
}
