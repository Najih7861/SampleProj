using Microsoft.EntityFrameworkCore;
using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Data;
using TourPackages.Api.Models;

namespace TourPackages.Api.Repositories;

/// <inheritdoc />
public class ReviewRepository : IReviewRepository
{
    private readonly AppDbContext _db;

    public ReviewRepository(AppDbContext db) => _db = db;

    public Task<Review?> GetByIdAsync(int id) =>
        _db.Reviews.FindAsync(id).AsTask();

    public Task<List<Review>> ListByPackageAsync(int packageId) =>
        _db.Reviews
            .Include(r => r.User)
            .Where(r => r.TourPackageId == packageId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

    public Task<PagedResult<Review>> ListByPackagePagedAsync(int packageId, PageRequest page) =>
        _db.Reviews
            .Include(r => r.User)
            .Where(r => r.TourPackageId == packageId)
            .OrderByDescending(r => r.CreatedAt)
            .ToPagedResultAsync(page);

    public async Task<(int Count, double Average)> GetSummaryAsync(int packageId)
    {
        var ratings = _db.Reviews.Where(r => r.TourPackageId == packageId);
        var count = await ratings.CountAsync();
        if (count == 0) return (0, 0);
        var average = await ratings.AverageAsync(r => (double)r.Rating);
        return (count, average);
    }

    public Task<bool> ExistsForUserAsync(int packageId, int userId) =>
        _db.Reviews.AnyAsync(r => r.TourPackageId == packageId && r.UserId == userId);

    public Task<bool> HasConfirmedBookingAsync(int packageId, int userId) =>
        _db.Bookings.AnyAsync(b =>
            b.TourPackageId == packageId &&
            b.UserId == userId &&
            b.Status == BookingStatus.Confirmed);

    public void Add(Review review) => _db.Reviews.Add(review);

    public void Remove(Review review) => _db.Reviews.Remove(review);

    public Task<int> SaveChangesAsync() => _db.SaveChangesAsync();
}
