using TourPackages.Api.Models;

namespace TourPackages.Api.Repositories;

public interface IReviewRepository
{
    Task<List<Review>> ListByPackageAsync(int packageId);
    Task<(int Count, double Average)> GetSummaryAsync(int packageId);
    Task<bool> ExistsForUserAsync(int packageId, int userId);
    void Add(Review review);
    Task<int> SaveChangesAsync();
}
