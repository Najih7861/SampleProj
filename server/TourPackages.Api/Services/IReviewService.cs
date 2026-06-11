using TourPackages.Api.Common.Results;
using TourPackages.Api.Dtos;

namespace TourPackages.Api.Services;

public interface IReviewService
{
    Task<IReadOnlyList<ReviewDto>> GetForPackageAsync(int packageId);
    Task<ReviewSummaryDto> GetSummaryAsync(int packageId);
    Task<Result<ReviewDto>> CreateAsync(CreateReviewDto dto, int userId, string username);
}
