using Microsoft.EntityFrameworkCore;
using TourPackages.Api.Models;

namespace TourPackages.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<TourPackage> TourPackages => Set<TourPackage>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Place> Places => Set<Place>();
    public DbSet<PlaceImage> PlaceImages => Set<PlaceImage>();

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
            // Optional grouping under a Place. Deleting a place must NOT delete
            // its packages, so the FK is set to null instead of cascading.
            e.HasOne(p => p.Place)
                .WithMany(pl => pl.Packages)
                .HasForeignKey(p => p.PlaceId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Booking>(e =>
        {
            e.Property(b => b.Status).HasConversion<int>();
            // Bookings are owned by a user once login-to-book is in effect.
            // Deleting a user leaves their bookings intact (UserId -> null).
            e.HasOne(b => b.User)
                .WithMany()
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Place>(e =>
        {
            e.HasMany(p => p.Images)
                .WithOne(i => i.Place)
                .HasForeignKey(i => i.PlaceId)
                .OnDelete(DeleteBehavior.Cascade);
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
                CreatedAt = seededAt,
                PlaceId = 1
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
                CreatedAt = seededAt,
                PlaceId = 2
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
                CreatedAt = seededAt,
                PlaceId = 3
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
                CreatedAt = seededAt,
                PlaceId = 4
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
                CreatedAt = seededAt,
                PlaceId = 5
            }
        );

        // Places (group the seeded packages) + their gallery photos. The first
        // image of each gallery is the themed hero; the rest are deterministic
        // placeholder photos so every slideshow has 5+ images out of the box.
        modelBuilder.Entity<Place>().HasData(
            new Place { Id = 1, Name = "Bali, Indonesia", CreatedAt = seededAt, Description = "A tropical paradise of palm-fringed beaches, emerald rice terraces, and clifftop temples. Bali blends laid-back surf towns with sacred mountain shrines, sunset cruises, and some of the warmest hospitality in Southeast Asia." },
            new Place { Id = 2, Name = "Interlaken, Switzerland", CreatedAt = seededAt, Description = "Cradled between two alpine lakes beneath the Eiger, Mönch, and Jungfrau peaks, Interlaken is the gateway to the Swiss Alps. Ride scenic cogwheel railways, hike wildflower trails, and breathe in crisp mountain air." },
            new Place { Id = 3, Name = "Kyoto, Japan", CreatedAt = seededAt, Description = "Japan's ancient capital, where golden pavilions, vermilion torii gates, and tranquil bamboo groves sit beside traditional tea houses. Kyoto is the heart of Japanese culture across every season." },
            new Place { Id = 4, Name = "Santorini, Greece", CreatedAt = seededAt, Description = "Whitewashed villages and blue-domed churches tumble down volcanic cliffs above the deep-blue Aegean. Santorini is famed for its caldera views, black-sand beaches, and unforgettable sunsets over Oia." },
            new Place { Id = 5, Name = "Serengeti, Tanzania", CreatedAt = seededAt, Description = "Endless golden savannah and the stage for the Great Migration. The Serengeti offers close-up encounters with lions, elephants, and wildebeest herds on guided game drives across one of Africa's greatest wildernesses." }
        );

        modelBuilder.Entity<PlaceImage>().HasData(
            // Place 1 — Bali
            new PlaceImage { Id = 1, PlaceId = 1, SortOrder = 0, Url = "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200" },
            new PlaceImage { Id = 2, PlaceId = 1, SortOrder = 1, Url = "https://picsum.photos/seed/bali-2/1200/700" },
            new PlaceImage { Id = 3, PlaceId = 1, SortOrder = 2, Url = "https://picsum.photos/seed/bali-3/1200/700" },
            new PlaceImage { Id = 4, PlaceId = 1, SortOrder = 3, Url = "https://picsum.photos/seed/bali-4/1200/700" },
            new PlaceImage { Id = 5, PlaceId = 1, SortOrder = 4, Url = "https://picsum.photos/seed/bali-5/1200/700" },
            // Place 2 — Interlaken
            new PlaceImage { Id = 6, PlaceId = 2, SortOrder = 0, Url = "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200" },
            new PlaceImage { Id = 7, PlaceId = 2, SortOrder = 1, Url = "https://picsum.photos/seed/alps-2/1200/700" },
            new PlaceImage { Id = 8, PlaceId = 2, SortOrder = 2, Url = "https://picsum.photos/seed/alps-3/1200/700" },
            new PlaceImage { Id = 9, PlaceId = 2, SortOrder = 3, Url = "https://picsum.photos/seed/alps-4/1200/700" },
            new PlaceImage { Id = 10, PlaceId = 2, SortOrder = 4, Url = "https://picsum.photos/seed/alps-5/1200/700" },
            // Place 3 — Kyoto
            new PlaceImage { Id = 11, PlaceId = 3, SortOrder = 0, Url = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200" },
            new PlaceImage { Id = 12, PlaceId = 3, SortOrder = 1, Url = "https://picsum.photos/seed/kyoto-2/1200/700" },
            new PlaceImage { Id = 13, PlaceId = 3, SortOrder = 2, Url = "https://picsum.photos/seed/kyoto-3/1200/700" },
            new PlaceImage { Id = 14, PlaceId = 3, SortOrder = 3, Url = "https://picsum.photos/seed/kyoto-4/1200/700" },
            new PlaceImage { Id = 15, PlaceId = 3, SortOrder = 4, Url = "https://picsum.photos/seed/kyoto-5/1200/700" },
            // Place 4 — Santorini
            new PlaceImage { Id = 16, PlaceId = 4, SortOrder = 0, Url = "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200" },
            new PlaceImage { Id = 17, PlaceId = 4, SortOrder = 1, Url = "https://picsum.photos/seed/santorini-2/1200/700" },
            new PlaceImage { Id = 18, PlaceId = 4, SortOrder = 2, Url = "https://picsum.photos/seed/santorini-3/1200/700" },
            new PlaceImage { Id = 19, PlaceId = 4, SortOrder = 3, Url = "https://picsum.photos/seed/santorini-4/1200/700" },
            new PlaceImage { Id = 20, PlaceId = 4, SortOrder = 4, Url = "https://picsum.photos/seed/santorini-5/1200/700" },
            // Place 5 — Serengeti
            new PlaceImage { Id = 21, PlaceId = 5, SortOrder = 0, Url = "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200" },
            new PlaceImage { Id = 22, PlaceId = 5, SortOrder = 1, Url = "https://picsum.photos/seed/serengeti-2/1200/700" },
            new PlaceImage { Id = 23, PlaceId = 5, SortOrder = 2, Url = "https://picsum.photos/seed/serengeti-3/1200/700" },
            new PlaceImage { Id = 24, PlaceId = 5, SortOrder = 3, Url = "https://picsum.photos/seed/serengeti-4/1200/700" },
            new PlaceImage { Id = 25, PlaceId = 5, SortOrder = 4, Url = "https://picsum.photos/seed/serengeti-5/1200/700" }
        );
    }
}
