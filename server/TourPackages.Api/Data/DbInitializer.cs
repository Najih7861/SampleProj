using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TourPackages.Api.Models;

namespace TourPackages.Api.Data;

/// <summary>
/// Idempotent startup seeding for data that can't be expressed as a static
/// migration seed (e.g. a hashed password, whose salt is non-deterministic).
/// </summary>
public static class DbInitializer
{
    public const string DefaultAdminUsername = "admin";
    public const string DefaultAdminEmail = "admin@wanderlust.local";
    public const string DefaultAdminPassword = "Admin@123";

    public static async Task SeedAdminAsync(AppDbContext db)
    {
        // Only create the default admin once.
        if (await db.Users.AnyAsync(u => u.Username == DefaultAdminUsername))
            return;

        var admin = new User
        {
            Username = DefaultAdminUsername,
            Email = DefaultAdminEmail,
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };
        admin.PasswordHash = new PasswordHasher<User>().HashPassword(admin, DefaultAdminPassword);

        db.Users.Add(admin);
        await db.SaveChangesAsync();
    }
}
