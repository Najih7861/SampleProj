using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourPackages.Api.Common.Results;
using TourPackages.Api.Dtos;
using TourPackages.Api.Services;

namespace TourPackages.Api.Controllers;

[ApiController]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviews;

    public ReviewsController(IReviewService reviews) => _reviews = reviews;

    private int? CurrentUserId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return int.TryParse(raw, out var id) ? id : null;
    }

    [HttpGet("api/packages/{packageId:int}/reviews")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetForPackage(int packageId)
    {
        var reviews = await _reviews.GetForPackageAsync(packageId);
        return Ok(reviews);
    }

    [HttpGet("api/packages/{packageId:int}/reviews/summary")]
    public async Task<ActionResult<ReviewSummaryDto>> GetSummary(int packageId)
    {
        var summary = await _reviews.GetSummaryAsync(packageId);
        return Ok(summary);
    }

    [HttpPost("api/reviews")]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> Create(CreateReviewDto dto)
    {
        if (User.IsInRole("Admin"))
            return Forbid();

        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        var username = User.FindFirstValue(ClaimTypes.Name)
                       ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                       ?? "Traveler";

        var result = await _reviews.CreateAsync(dto, userId.Value, username);
        if (!result.IsSuccess) return result.ToErrorResult(this);

        return CreatedAtAction(nameof(GetForPackage), new { packageId = result.Value!.TourPackageId }, result.Value);
    }
}
