using TourPackages.Api.Dtos;
using TourPackages.Api.Repositories;

namespace TourPackages.Api.Services;

public class AdminStatsService : IAdminStatsService
{
    private readonly IAdminStatsRepository _stats;

    public AdminStatsService(IAdminStatsRepository stats) => _stats = stats;

    public async Task<AdminStatsDto> GetStatsAsync()
    {
        // Sequential awaits: all reads share one scoped AppDbContext, which is
        // not safe for concurrent queries. The COUNT/AVG queries are trivially fast.
        var totalPackages = await _stats.CountPackagesAsync();
        var totalPlaces = await _stats.CountPlacesAsync();
        var (totalBookings, pending, confirmed, cancelled) = await _stats.CountBookingsByStatusAsync();
        var (reviewCount, average) = await _stats.GetReviewSummaryAsync();

        return new AdminStatsDto(
            totalPackages,
            totalPlaces,
            totalBookings,
            pending,
            confirmed,
            cancelled,
            reviewCount,
            Math.Round(average, 1)); // mirrors ReviewService.GetSummaryAsync rounding
    }
}
