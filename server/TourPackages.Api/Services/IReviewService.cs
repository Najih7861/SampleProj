using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Common.Results;
using TourPackages.Api.Dtos;

namespace TourPackages.Api.Services;

/// <summary>
/// Reviews &amp; ratings for tour packages. Net-new, additive service — separate
/// from the package/booking services so their contracts stay untouched.
/// </summary>
public interface IReviewService
{
    Task<IReadOnlyList<ReviewDto>> GetForPackageAsync(int packageId);

    Task<PagedResult<ReviewDto>> GetForPackagePagedAsync(int packageId, PageRequest page);

    Task<ReviewSummaryDto> GetSummaryAsync(int packageId);

    /// <summary>
    /// Creates a review when the package exists, the user has a Confirmed
    /// booking for it, and the user has not already reviewed it.
    /// </summary>
    Task<Result<ReviewDto>> CreateAsync(CreateReviewDto dto, int userId, string username);

    /// <summary>Deletes a review when it exists and the caller owns it (or is admin).</summary>
    Task<Result> DeleteAsync(int reviewId, int userId, bool isAdmin);
}
