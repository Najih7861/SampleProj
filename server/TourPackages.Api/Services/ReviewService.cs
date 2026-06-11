using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Common.Results;
using TourPackages.Api.Dtos;
using TourPackages.Api.Mapping;
using TourPackages.Api.Models;
using TourPackages.Api.Repositories;

namespace TourPackages.Api.Services;

/// <inheritdoc />
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
        return items.Select(r => r.ToDto()).ToList();
    }

    public async Task<PagedResult<ReviewDto>> GetForPackagePagedAsync(int packageId, PageRequest page)
    {
        var result = await _reviews.ListByPackagePagedAsync(packageId, page);
        return result.Map(r => r.ToDto());
    }

    public async Task<ReviewSummaryDto> GetSummaryAsync(int packageId)
    {
        var (count, average) = await _reviews.GetSummaryAsync(packageId);
        // Round to one decimal place for display (e.g. 4.3).
        return new ReviewSummaryDto(Math.Round(average, 1), count);
    }

    public async Task<Result<ReviewDto>> CreateAsync(CreateReviewDto dto, int userId, string username)
    {
        var package = await _packages.GetByIdAsync(dto.TourPackageId);
        if (package is null)
            return Result<ReviewDto>.Invalid($"Tour package {dto.TourPackageId} does not exist.");

        // Verified-customer gate: only travelers with a confirmed booking may review.
        if (!await _reviews.HasConfirmedBookingAsync(dto.TourPackageId, userId))
            return Result<ReviewDto>.Invalid("You can review a tour only after you have a confirmed booking for it.");

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

        // Build the DTO directly with the author's username from the JWT (no
        // extra round trip to load the User navigation).
        return Result<ReviewDto>.Success(new ReviewDto(
            review.Id, review.TourPackageId, review.UserId, username,
            review.Rating, review.Comment, review.CreatedAt));
    }

    public async Task<Result> DeleteAsync(int reviewId, int userId, bool isAdmin)
    {
        var review = await _reviews.GetByIdAsync(reviewId);
        if (review is null) return Result.NotFound();

        // Owner or admin only; hide others' reviews behind a 404.
        if (!isAdmin && review.UserId != userId)
            return Result.NotFound();

        _reviews.Remove(review);
        await _reviews.SaveChangesAsync();
        return Result.Success();
    }
}
