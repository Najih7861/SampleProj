using TourPackages.Api.Dtos;
using TourPackages.Api.Models;

namespace TourPackages.Api.Mapping;

/// <summary>
/// Entity → DTO mapping for reviews. Flattens the author's username (mirrors the
/// way BookingMappings flattens the package title). Manual, zero-dependency.
/// </summary>
public static class ReviewMappings
{
    public static ReviewDto ToDto(this Review r) => new(
        r.Id,
        r.TourPackageId,
        r.UserId,
        r.User?.Username ?? string.Empty,
        r.Rating,
        r.Comment,
        r.CreatedAt);
}
