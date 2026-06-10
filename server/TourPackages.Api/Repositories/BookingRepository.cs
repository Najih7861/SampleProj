using Microsoft.EntityFrameworkCore;
using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Data;
using TourPackages.Api.Models;

namespace TourPackages.Api.Repositories;

/// <inheritdoc />
public class BookingRepository : IBookingRepository
{
    private readonly AppDbContext _db;

    public BookingRepository(AppDbContext db) => _db = db;

    public Task<Booking?> GetByIdAsync(int id) =>
        _db.Bookings.FindAsync(id).AsTask();

    public Task<Booking?> GetByIdWithPackageAsync(int id) =>
        _db.Bookings.Include(x => x.TourPackage).FirstOrDefaultAsync(x => x.Id == id);

    public Task<List<Booking>> ListByUserAsync(int userId) =>
        _db.Bookings
            .Include(b => b.TourPackage)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();

    public Task<PagedResult<Booking>> ListByUserPagedAsync(int userId, PageRequest page) =>
        _db.Bookings
            .Include(b => b.TourPackage)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .ToPagedResultAsync(page);

    public Task<List<Booking>> ListAsync(BookingStatus? status)
    {
        var query = _db.Bookings.Include(b => b.TourPackage).AsQueryable();
        if (status.HasValue)
            query = query.Where(b => b.Status == status.Value);

        return query
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
    }

    public Task<PagedResult<Booking>> ListPagedAsync(BookingStatus? status, PageRequest page)
    {
        var query = _db.Bookings.Include(b => b.TourPackage).AsQueryable();
        if (status.HasValue)
            query = query.Where(b => b.Status == status.Value);

        return query
            .OrderByDescending(b => b.CreatedAt)
            .ToPagedResultAsync(page);
    }

    public void Add(Booking booking) => _db.Bookings.Add(booking);

    public Task<int> SaveChangesAsync() => _db.SaveChangesAsync();
}
