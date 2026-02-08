<<<<<<< Updated upstream
=======
using IdentityServerApi.Models;
>>>>>>> Stashed changes
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace IdentityServerApi.Data
{
    // Extending IdentityDbContext handles all the User/Role tables for you
<<<<<<< Updated upstream
    public class ApplicationDbContext : IdentityDbContext
=======
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
>>>>>>> Stashed changes
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
    }
}