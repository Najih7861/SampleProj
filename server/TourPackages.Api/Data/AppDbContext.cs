using Microsoft.EntityFrameworkCore;
using TourPackages.Api.Models;

namespace TourPackages.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TourPackage> TourPackages => Set<TourPackage>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<TourPackage>(e =>
        {
            e.Property(p => p.Price).HasColumnType("numeric(10,2)");
            e.HasMany(p => p.Bookings)
                .WithOne(b => b.TourPackage)
                .HasForeignKey(b => b.TourPackageId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Booking>(e =>
        {
            e.Property(b => b.Status).HasConversion<int>();
        });

        modelBuilder.Entity<User>(e =>
        {
            // Same convention as BookingStatus: string on the wire, int in the DB.
            e.Property(u => u.Role).HasConversion<int>();
            e.HasIndex(u => u.Username).IsUnique();
            e.HasIndex(u => u.Email).IsUnique();
        });

        // Deterministic seed data (fixed timestamps so migrations are stable).
        var seededAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        modelBuilder.Entity<TourPackage>().HasData(
            new TourPackage
            {
                Id = 1,
                Title = "Bali Beach Escape",
                Destination = "Bali, Indonesia",
                Description = "Seven days of pristine beaches, temples, and sunset cruises in tropical paradise.",
                Price = 1299.00m,
                DurationDays = 7,
                ImageUrl = "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
                IsAvailable = true,
                CreatedAt = seededAt
            },
            new TourPackage
            {
                Id = 2,
                Title = "Swiss Alps Adventure",
                Destination = "Interlaken, Switzerland",
                Description = "Hike alpine trails, ride scenic railways, and breathe in the crisp mountain air.",
                Price = 2199.00m,
                DurationDays = 5,
                ImageUrl = "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
                IsAvailable = true,
                CreatedAt = seededAt
            },
            new TourPackage
            {
                Id = 3,
                Title = "Kyoto Cultural Journey",
                Destination = "Kyoto, Japan",
                Description = "Explore ancient temples, bamboo groves, and traditional tea ceremonies.",
                Price = 1750.00m,
                DurationDays = 6,
                ImageUrl = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
                IsAvailable = true,
                CreatedAt = seededAt
            },
            new TourPackage
            {
                Id = 4,
                Title = "Santorini Island Getaway",
                Destination = "Santorini, Greece",
                Description = "Whitewashed villages, blue domes, and unforgettable Aegean sunsets.",
                Price = 1599.00m,
                DurationDays = 4,
                ImageUrl = "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800",
                IsAvailable = true,
                CreatedAt = seededAt
            },
            new TourPackage
            {
                Id = 5,
                Title = "Safari in the Serengeti",
                Destination = "Serengeti, Tanzania",
                Description = "Witness the great migration up close on a guided wildlife safari.",
                Price = 3299.00m,
                DurationDays = 8,
                ImageUrl = "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800",
                IsAvailable = true,
                CreatedAt = seededAt
            }
        );
    }
}
