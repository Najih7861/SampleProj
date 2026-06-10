using TourPackages.Api.Dtos;
using TourPackages.Api.Models;

namespace TourPackages.Api.Mapping;

/// <summary>
/// Entity → DTO mapping for places. Mirrors the original PlacesController.ToDto
/// exactly: orders the gallery by SortOrder and the grouped packages by Id.
/// Manual, zero-dependency mapper. Assumes Images and Packages are loaded.
/// </summary>
public static class PlaceMappings
{
    public static PlaceDto ToDto(this Place p) => new(
        p.Id,
        p.Name,
        p.Description,
        p.CreatedAt,
        p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToList(),
        p.Packages
            .OrderBy(pk => pk.Id)
            .Select(pk => new PlacePackageDto(pk.Id, pk.Title, pk.Price, pk.DurationDays, pk.IsAvailable))
            .ToList());
}
