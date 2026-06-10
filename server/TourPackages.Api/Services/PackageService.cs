using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Common.Results;
using TourPackages.Api.Dtos;
using TourPackages.Api.Mapping;
using TourPackages.Api.Models;
using TourPackages.Api.Repositories;

namespace TourPackages.Api.Services;

/// <inheritdoc />
public class PackageService : IPackageService
{
    private readonly IPackageRepository _packages;

    public PackageService(IPackageRepository packages) => _packages = packages;

    public async Task<IReadOnlyList<PackageDto>> GetAllAsync(string? destination, decimal? minPrice, decimal? maxPrice)
    {
        var items = await _packages.ListAsync(destination, minPrice, maxPrice);
        return items.Select(p => p.ToDto()).ToList();
    }

    public async Task<PagedResult<PackageDto>> GetPagedAsync(string? destination, decimal? minPrice, decimal? maxPrice, PageRequest page)
    {
        var result = await _packages.ListPagedAsync(destination, minPrice, maxPrice, page);
        return result.Map(p => p.ToDto());
    }

    public async Task<PackageDto?> GetByIdAsync(int id)
    {
        var package = await _packages.GetByIdAsync(id);
        return package?.ToDto();
    }

    public async Task<PackageDto> CreateAsync(CreatePackageDto dto)
    {
        var package = new TourPackage
        {
            Title = dto.Title,
            Destination = dto.Destination,
            Description = dto.Description,
            Price = dto.Price,
            DurationDays = dto.DurationDays,
            ImageUrl = dto.ImageUrl,
            IsAvailable = dto.IsAvailable,
            PlaceId = dto.PlaceId,
            CreatedAt = DateTime.UtcNow
        };

        _packages.Add(package);
        await _packages.SaveChangesAsync();
        return package.ToDto();
    }

    public async Task<Result> UpdateAsync(int id, UpdatePackageDto dto)
    {
        var package = await _packages.GetByIdAsync(id);
        if (package is null) return Result.NotFound();

        package.Title = dto.Title;
        package.Destination = dto.Destination;
        package.Description = dto.Description;
        package.Price = dto.Price;
        package.DurationDays = dto.DurationDays;
        package.ImageUrl = dto.ImageUrl;
        package.IsAvailable = dto.IsAvailable;
        package.PlaceId = dto.PlaceId;

        await _packages.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result> DeleteAsync(int id)
    {
        var package = await _packages.GetByIdAsync(id);
        if (package is null) return Result.NotFound();

        _packages.Remove(package);
        await _packages.SaveChangesAsync();
        return Result.Success();
    }
}
