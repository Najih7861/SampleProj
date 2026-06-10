using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Models;

namespace TourPackages.Api.Repositories;

/// <summary>
/// Data access for tour packages. Net-new, additive abstraction over AppDbContext.
/// </summary>
public interface IPackageRepository
{
    Task<TourPackage?> GetByIdAsync(int id);

    /// <summary>
    /// Packages filtered by optional destination substring and price bounds,
    /// newest first. Filtering is translated to SQL by EF Core.
    /// </summary>
    Task<List<TourPackage>> ListAsync(string? destination, decimal? minPrice, decimal? maxPrice);

    /// <summary>A single page of filtered packages plus the total matching count.</summary>
    Task<PagedResult<TourPackage>> ListPagedAsync(string? destination, decimal? minPrice, decimal? maxPrice, PageRequest page);

    void Add(TourPackage package);

    void Remove(TourPackage package);

    Task<int> SaveChangesAsync();
}
