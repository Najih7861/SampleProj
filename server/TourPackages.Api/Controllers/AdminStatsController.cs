using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourPackages.Api.Dtos;
using TourPackages.Api.Services;

namespace TourPackages.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
public class AdminStatsController : ControllerBase
{
    private readonly IAdminStatsService _stats;

    public AdminStatsController(IAdminStatsService stats) => _stats = stats;

    // GET /api/admin/stats — dashboard counts in a single call (admin only).
    // Per-action absolute route (ReviewsController style); the [controller] token
    // would resolve to "adminstats", not "admin".
    [HttpGet("api/admin/stats")]
    public async Task<ActionResult<AdminStatsDto>> GetStats()
    {
        var stats = await _stats.GetStatsAsync();
        return Ok(stats);
    }
}
