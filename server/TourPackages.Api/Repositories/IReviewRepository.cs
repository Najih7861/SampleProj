using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Models;

namespace TourPackages.Api.Repositories;

/// <summary>
/// Data access for package reviews. Net-new, additive abstraction over
/// AppDbContext (also reads bookings to verify a reviewer is a real customer).
/// </summary>
public interface IReviewRepository
{
    /// <summary>Loads a review by id (no related data).</summary>
    Task<Review?> GetByIdAsync(int id);

    /// <summary>Reviews for a package, newest first, with the author included.</summary>
    Task<List<Review>> ListByPackageAsync(int packageId);

    /// <summary>A single page of a package's reviews plus the total count.</summary>
    Task<PagedResult<Review>> ListByPackagePagedAsync(int packageId, PageRequest page);

    /// <summary>(count, average rating) for a package. Average is 0 when none.</summary>
    Task<(int Count, double Average)> GetSummaryAsync(int packageId);

    /// <summary>True if the user has already reviewed this package.</summary>
    Task<bool> ExistsForUserAsync(int packageId, int userId);

    /// <summary>True if the user has a Confirmed booking for this package.</summary>
    Task<bool> HasConfirmedBookingAsync(int packageId, int userId);

    void Add(Review review);

    void Remove(Review review);

    Task<int> SaveChangesAsync();
}
