using TourPackages.Api.Common.Results;
using TourPackages.Api.Dtos;
using TourPackages.Api.Mapping;
using TourPackages.Api.Models;
using TourPackages.Api.Repositories;

namespace TourPackages.Api.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviews;
    private readonly IPackageRepository _packages;

    public ReviewService(IReviewRepository reviews, IPackageRepository packages)
    {
        _reviews = reviews;
        _packages = packages;
    }

    public async Task<IReadOnlyList<ReviewDto>> GetForPackageAsync(int packageId)
    {
        var items = await _reviews.ListByPackageAsync(packageId);
        return items.Select(review => review.ToDto()).ToList();
    }

    public async Task<ReviewSummaryDto> GetSummaryAsync(int packageId)
    {
        var (count, average) = await _reviews.GetSummaryAsync(packageId);
        return new ReviewSummaryDto(Math.Round(average, 1), count);
    }

    public async Task<Result<ReviewDto>> CreateAsync(CreateReviewDto dto, int userId, string username)
    {
        var package = await _packages.GetByIdAsync(dto.TourPackageId);
        if (package is null)
            return Result<ReviewDto>.Invalid($"Tour package {dto.TourPackageId} does not exist.");

        if (await _reviews.ExistsForUserAsync(dto.TourPackageId, userId))
            return Result<ReviewDto>.Conflict("You have already reviewed this tour.");

        var review = new Review
        {
            TourPackageId = dto.TourPackageId,
            UserId = userId,
            Rating = dto.Rating,
            Comment = string.IsNullOrWhiteSpace(dto.Comment) ? null : dto.Comment.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _reviews.Add(review);
        await _reviews.SaveChangesAsync();

        return Result<ReviewDto>.Success(new ReviewDto(
            review.Id,
            review.TourPackageId,
            review.UserId,
            username,
            review.Rating,
            review.Comment,
            review.CreatedAt));
    }
}
