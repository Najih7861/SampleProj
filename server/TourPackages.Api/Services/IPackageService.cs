using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Common.Results;
using TourPackages.Api.Dtos;

namespace TourPackages.Api.Services;

/// <summary>Tour package domain operations (CRUD + filtered listing).</summary>
public interface IPackageService
{
    Task<IReadOnlyList<PackageDto>> GetAllAsync(string? destination, decimal? minPrice, decimal? maxPrice);

    /// <summary>A single page of filtered packages plus the total matching count.</summary>
    Task<PagedResult<PackageDto>> GetPagedAsync(string? destination, decimal? minPrice, decimal? maxPrice, PageRequest page);

    Task<PackageDto?> GetByIdAsync(int id);

    Task<PackageDto> CreateAsync(CreatePackageDto dto);

    Task<Result> UpdateAsync(int id, UpdatePackageDto dto);

    Task<Result> DeleteAsync(int id);
}
