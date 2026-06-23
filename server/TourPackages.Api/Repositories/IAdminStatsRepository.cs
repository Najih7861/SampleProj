namespace TourPackages.Api.Repositories;

/// <summary>
/// Aggregate (COUNT / AVG) reads for the admin dashboard. Net-new, additive
/// abstraction over AppDbContext — services never touch EF Core directly.
/// </summary>
public interface IAdminStatsRepository
{
    Task<int> CountPackagesAsync();
    Task<int> CountPlacesAsync();

    /// <summary>Total bookings plus per-status counts from a single grouped query.</summary>
    Task<(int Total, int Pending, int Confirmed, int Cancelled)> CountBookingsByStatusAsync();

    /// <summary>Review count and raw (unrounded) average rating; (0, 0) when there are none.</summary>
    Task<(int Count, double Average)> GetReviewSummaryAsync();
}
