using TourPackages.Api.Common.Results;

namespace TourPackages.Api.Services;

/// <summary>
/// Self-service cancellation of a user's own booking. Net-new, additive
/// service — separate from IBookingService so the existing booking contract
/// stays untouched.
/// </summary>
public interface IBookingCancellationService
{
    /// <summary>
    /// Cancels the booking if it belongs to <paramref name="userId"/>, is not
    /// already cancelled, and its travel date is still in the future.
    /// Non-owned bookings report NotFound (existence is hidden, matching
    /// IBookingService.GetByIdForUserAsync).
    /// </summary>
    Task<Result> CancelOwnAsync(int bookingId, int userId);
}
