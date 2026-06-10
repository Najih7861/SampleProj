using TourPackages.Api.Dtos;
using TourPackages.Api.Models;

namespace TourPackages.Api.Mapping;

/// <summary>
/// Entity → DTO mapping for tour packages. Mirrors the original
/// PackagesController.ToDto exactly. Manual, zero-dependency mapper.
/// </summary>
public static class PackageMappings
{
    public static PackageDto ToDto(this TourPackage p) => new(
        p.Id,
        p.Title,
        p.Destination,
        p.Description,
        p.Price,
        p.DurationDays,
        p.ImageUrl,
        p.IsAvailable,
        p.CreatedAt,
        p.PlaceId);
}
