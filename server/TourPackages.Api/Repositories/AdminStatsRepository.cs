using Microsoft.EntityFrameworkCore;
using TourPackages.Api.Data;
using TourPackages.Api.Models;

namespace TourPackages.Api.Repositories;

public class AdminStatsRepository : IAdminStatsRepository
{
    private readonly AppDbContext _db;

    public AdminStatsRepository(AppDbContext db) => _db = db;

    public Task<int> CountPackagesAsync() => _db.TourPackages.CountAsync();

    public Task<int> CountPlacesAsync() => _db.Places.CountAsync();

    public async Task<(int Total, int Pending, int Confirmed, int Cancelled)> CountBookingsByStatusAsync()
    {
        // One grouped COUNT query (SELECT Status, COUNT(*) ... GROUP BY Status).
        // Status is mapped HasConversion<int>(), so grouping by the enum is fully
        // SQL-translatable and no Booking entities are materialized.
        var byStatus = await _db.Bookings
            .GroupBy(booking => booking.Status)
            .Select(group => new { Status = group.Key, Count = group.Count() })
            .ToListAsync();

        int CountFor(BookingStatus status) =>
            byStatus.FirstOrDefault(entry => entry.Status == status)?.Count ?? 0;

        var pending = CountFor(BookingStatus.Pending);
        var confirmed = CountFor(BookingStatus.Confirmed);
        var cancelled = CountFor(BookingStatus.Cancelled);
        var total = byStatus.Sum(entry => entry.Count);

        return (total, pending, confirmed, cancelled);
    }

    // Mirrors ReviewRepository.GetSummaryAsync (CountAsync + AverageAsync, zero-guarded).
    public async Task<(int Count, double Average)> GetReviewSummaryAsync()
    {
        var count = await _db.Reviews.CountAsync();
        if (count == 0) return (0, 0);

        var average = await _db.Reviews.AverageAsync(review => (double)review.Rating);
        return (count, average);
    }
}
