using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Models;

namespace TourPackages.Api.Repositories;

/// <summary>
/// Data access for bookings. Wraps AppDbContext so the service layer never
/// touches EF Core directly. Net-new, additive abstraction.
/// </summary>
public interface IBookingRepository
{
    /// <summary>Loads a booking by id (no related data).</summary>
    Task<Booking?> GetByIdAsync(int id);

    /// <summary>Loads a booking by id with its TourPackage eagerly included.</summary>
    Task<Booking?> GetByIdWithPackageAsync(int id);

    /// <summary>The given user's bookings, newest first, with package included.</summary>
    Task<List<Booking>> ListByUserAsync(int userId);

    /// <summary>A single page of the given user's bookings plus the total count.</summary>
    Task<PagedResult<Booking>> ListByUserPagedAsync(int userId, PageRequest page);

    /// <summary>All bookings (optionally filtered by status), newest first, with package included.</summary>
    Task<List<Booking>> ListAsync(BookingStatus? status);

    /// <summary>A single page of all bookings (optionally filtered) plus the total count.</summary>
    Task<PagedResult<Booking>> ListPagedAsync(BookingStatus? status, PageRequest page);

    void Add(Booking booking);

    Task<int> SaveChangesAsync();
}
