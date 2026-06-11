using TourPackages.Api.Dtos;
using TourPackages.Api.Models;

namespace TourPackages.Api.Mapping;

public static class ReviewMappings
{
    public static ReviewDto ToDto(this Review review) => new(
        review.Id,
        review.TourPackageId,
        review.UserId,
        review.User?.Username ?? "Traveler",
        review.Rating,
        review.Comment,
        review.CreatedAt);
}
