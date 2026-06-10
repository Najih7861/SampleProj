using Microsoft.EntityFrameworkCore;
using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Data;
using TourPackages.Api.Models;

namespace TourPackages.Api.Repositories;

/// <inheritdoc />
public class PackageRepository : IPackageRepository
{
    private readonly AppDbContext _db;

    public PackageRepository(AppDbContext db) => _db = db;

    public Task<TourPackage?> GetByIdAsync(int id) =>
        _db.TourPackages.FindAsync(id).AsTask();

    public Task<List<TourPackage>> ListAsync(string? destination, decimal? minPrice, decimal? maxPrice)
    {
        var query = _db.TourPackages.AsQueryable();

        if (!string.IsNullOrWhiteSpace(destination))
            query = query.Where(p => p.Destination.ToLower().Contains(destination.ToLower()));
        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);
        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);

        return query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
    }

    public Task<PagedResult<TourPackage>> ListPagedAsync(string? destination, decimal? minPrice, decimal? maxPrice, PageRequest page)
    {
        var query = _db.TourPackages.AsQueryable();

        if (!string.IsNullOrWhiteSpace(destination))
            query = query.Where(p => p.Destination.ToLower().Contains(destination.ToLower()));
        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);
        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);

        return query
            .OrderByDescending(p => p.CreatedAt)
            .ToPagedResultAsync(page);
    }

    public void Add(TourPackage package) => _db.TourPackages.Add(package);

    public void Remove(TourPackage package) => _db.TourPackages.Remove(package);

    public Task<int> SaveChangesAsync() => _db.SaveChangesAsync();
}
