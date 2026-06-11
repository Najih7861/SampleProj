using TourPackages.Api.Common.Results;
using TourPackages.Api.Models;
using TourPackages.Api.Repositories;

namespace TourPackages.Api.Services;

/// <inheritdoc />
public class BookingCancellationService : IBookingCancellationService
{
    private readonly IBookingRepository _bookings;

    public BookingCancellationService(IBookingRepository bookings) => _bookings = bookings;

    public async Task<Result> CancelOwnAsync(int bookingId, int userId)
    {
        var booking = await _bookings.GetByIdAsync(bookingId);
        if (booking is null)
            return Result.NotFound();

        // Owner only; hide other users' bookings behind a 404.
        if (booking.UserId != userId)
            return Result.NotFound();

        if (booking.Status == BookingStatus.Cancelled)
            return Result.Invalid("This booking is already cancelled.");

        // Self-service cancellation closes once the travel date arrives;
        // after that only an admin can change the status.
        if (booking.TravelDate <= DateTime.UtcNow)
            return Result.Invalid("This booking can no longer be cancelled because the travel date has passed.");

        booking.Status = BookingStatus.Cancelled;
        await _bookings.SaveChangesAsync();
        return Result.Success();
    }
}
