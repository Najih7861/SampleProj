using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Common.Results;
using TourPackages.Api.Dtos;
using TourPackages.Api.Services;

namespace TourPackages.Api.Controllers;

/// <summary>
/// Reviews &amp; ratings for tour packages. Net-new, additive controller — public
/// reads, authenticated writes. Does not touch PackagesController. Routes are
/// declared per-action because reads hang off /api/packages/{id}/reviews while
/// writes live under /api/reviews.
/// </summary>
[ApiController]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviews;

    public ReviewsController(IReviewService reviews) => _reviews = reviews;

    // Reads the user id from the JWT "sub"/NameIdentifier claim.
    private int? CurrentUserId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return int.TryParse(raw, out var id) ? id : null;
    }

    // GET /api/packages/{packageId}/reviews?page=&pageSize=  (public)
    // Pagination is opt-in; the total count is returned in the X-Total-Count header.
    [HttpGet("api/packages/{packageId:int}/reviews")]
    public async Task<ActionResult<IEnumerable<ReviewDto>>> GetForPackage(
        int packageId, [FromQuery] int? page, [FromQuery] int? pageSize)
    {
        var paging = PageRequest.FromQuery(page, pageSize);
        if (paging is null)
        {
            var all = await _reviews.GetForPackageAsync(packageId);
            Response.Headers[PageRequest.TotalCountHeader] = all.Count.ToString();
            return Ok(all);
        }

        var result = await _reviews.GetForPackagePagedAsync(packageId, paging);
        Response.Headers[PageRequest.TotalCountHeader] = result.Total.ToString();
        return Ok(result.Items);
    }

    // GET /api/packages/{packageId}/reviews/summary  (public)
    [HttpGet("api/packages/{packageId:int}/reviews/summary")]
    public async Task<ActionResult<ReviewSummaryDto>> GetSummary(int packageId)
    {
        var summary = await _reviews.GetSummaryAsync(packageId);
        return Ok(summary);
    }

    // POST /api/reviews  (signed-in user who has a confirmed booking)
    [HttpPost("api/reviews")]
    [Authorize]
    public async Task<ActionResult<ReviewDto>> Create(CreateReviewDto dto)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();
        var username = User.FindFirstValue(ClaimTypes.Name) ?? string.Empty;

        var result = await _reviews.CreateAsync(dto, userId.Value, username);
        if (!result.IsSuccess) return result.ToErrorResult(this);
        return CreatedAtAction(nameof(GetForPackage),
            new { packageId = result.Value!.TourPackageId }, result.Value);
    }

    // DELETE /api/reviews/{id}  (owner or admin)
    [HttpDelete("api/reviews/{id:int}")]
    [Authorize]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        var result = await _reviews.DeleteAsync(id, userId.Value, User.IsInRole("Admin"));
        return result.IsSuccess ? NoContent() : result.ToErrorResult(this);
    }
}
