using Microsoft.EntityFrameworkCore;
using PokeDex_Api.Models;

namespace PokeDex_Api.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Pokemon> Pokemons { get; set; }
    public DbSet<Capture> Captures { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure Pokemon entity
        modelBuilder.Entity<Pokemon>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(100);
            entity.Property(p => p.Type).IsRequired().HasMaxLength(50);
        });

        // Configure Capture entity
        modelBuilder.Entity<Capture>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.UserId).IsRequired().HasMaxLength(450);
            entity.Property(c => c.CapturedAt).IsRequired();

            // Foreign key relationship
            entity.HasOne(c => c.Pokemon)
                .WithMany(p => p.Captures)
                .HasForeignKey(c => c.PokemonId)
                .OnDelete(DeleteBehavior.Cascade);

            // Unique constraint: A user can only capture the same Pokemon once
            entity.HasIndex(c => new { c.UserId, c.PokemonId })
                .IsUnique()
                .HasDatabaseName("IX_Captures_UserId_PokemonId");
        });
    }
}
