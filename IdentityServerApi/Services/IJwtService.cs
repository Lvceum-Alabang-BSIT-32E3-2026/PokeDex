using IdentityServerApi.Models;

namespace IdentityServerApi.Services;

public interface IJwtService
{
    string GenerateToken(ApplicationUser user, IList<string> roles);
}
