using IdentityServerApi.Models;

namespace IdentityServerApi.Services;

public interface IJwtService
{
    Task<string> GenerateToken(ApplicationUser user);
}
