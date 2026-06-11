using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Common.Results;
using TourPackages.Api.Dtos;
using TourPackages.Api.Models;

namespace TourPackages.Api.Services;

/// <summary>
/// Decorator over <see cref="IBookingService"/> that sends a notification email
/// after a booking is created or its status changes. Net-new, additive — the
/// inner <see cref="BookingService"/> is untouched (Open/Closed). All reads and
/// the booking rules delegate straight through; only the two write paths gain a
/// post-success email side-effect (which can never throw — see BookingEmailService).
/// </summary>
public class BookingNotifyingBookingService : IBookingService
{
    private readonly IBookingService _inner;
    private readonly IBookingEmailService _email;

    public BookingNotifyingBookingService(IBookingService inner, IBookingEmailService email)
    {
        _inner = inner;
        _email = email;
    }

    // ---- Reads: pure pass-through ----
    public Task<BookingDto?> GetByIdAsync(int id) => _inner.GetByIdAsync(id);

    public Task<Result<BookingDto>> GetByIdForUserAsync(int id, int? userId, bool isAdmin) =>
        _inner.GetByIdForUserAsync(id, userId, isAdmin);

    public Task<IReadOnlyList<BookingDto>> GetMineAsync(int userId) => _inner.GetMineAsync(userId);

    public Task<PagedResult<BookingDto>> GetMinePagedAsync(int userId, PageRequest page) =>
        _inner.GetMinePagedAsync(userId, page);

    public Task<IReadOnlyList<BookingDto>> GetAllAsync(BookingStatus? status) => _inner.GetAllAsync(status);

    public Task<PagedResult<BookingDto>> GetAllPagedAsync(BookingStatus? status, PageRequest page) =>
        _inner.GetAllPagedAsync(status, page);

    // ---- Writes: delegate, then notify on success ----
    public async Task<Result<BookingDto>> CreateAsync(CreateBookingDto dto, int? userId)
    {
        var result = await _inner.CreateAsync(dto, userId);
        if (result.IsSuccess && result.Value is not null)
            await _email.SendBookingReceivedAsync(result.Value);
        return result;
    }

    public async Task<Result> UpdateStatusAsync(int id, BookingStatus status)
    {
        var result = await _inner.UpdateStatusAsync(id, status);
        if (result.IsSuccess)
        {
            // Reload via the inner service to get the flattened DTO (email,
            // package title, new status) for the notification.
            var booking = await _inner.GetByIdAsync(id);
            if (booking is not null)
                await _email.SendStatusChangedAsync(booking);
        }
        return result;
    }
}
