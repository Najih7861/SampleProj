using Microsoft.EntityFrameworkCore;
using TourPackages.Api.Data;
using TourPackages.Api.Models;

namespace TourPackages.Api.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly AppDbContext _db;

    public ReviewRepository(AppDbContext db) => _db = db;

    public Task<List<Review>> ListByPackageAsync(int packageId) =>
        _db.Reviews
            .Include(review => review.User)
            .Where(review => review.TourPackageId == packageId)
            .OrderByDescending(review => review.CreatedAt)
            .ToListAsync();

    public async Task<(int Count, double Average)> GetSummaryAsync(int packageId)
    {
        var query = _db.Reviews.Where(review => review.TourPackageId == packageId);
        var count = await query.CountAsync();
        if (count == 0) return (0, 0);

        var average = await query.AverageAsync(review => (double)review.Rating);
        return (count, average);
    }

    public Task<bool> ExistsForUserAsync(int packageId, int userId) =>
        _db.Reviews.AnyAsync(review => review.TourPackageId == packageId && review.UserId == userId);

    public void Add(Review review) => _db.Reviews.Add(review);

    public Task<int> SaveChangesAsync() => _db.SaveChangesAsync();
}
