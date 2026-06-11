using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourPackages.Api.Common.Results;
using TourPackages.Api.Services;

namespace TourPackages.Api.Controllers;

/// <summary>
/// Lets a signed-in user cancel their own upcoming booking. Net-new, additive
/// controller — shares the api/bookings route prefix but lives in its own file
/// so BookingsController stays untouched.
/// </summary>
[ApiController]
[Route("api/bookings")]
public class BookingCancellationController : ControllerBase
{
    private readonly IBookingCancellationService _cancellations;

    public BookingCancellationController(IBookingCancellationService cancellations) =>
        _cancellations = cancellations;

    // Reads the user id from the JWT "sub"/NameIdentifier claim.
    private int? CurrentUserId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");
        return int.TryParse(raw, out var id) ? id : null;
    }

    // POST /api/bookings/{id}/cancel  (owner cancels their own upcoming booking)
    [HttpPost("{id:int}/cancel")]
    [Authorize]
    public async Task<IActionResult> Cancel(int id)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        var result = await _cancellations.CancelOwnAsync(id, userId.Value);
        return result.IsSuccess ? NoContent() : result.ToErrorResult(this);
    }
}
