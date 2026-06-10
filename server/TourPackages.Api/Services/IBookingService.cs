using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Common.Results;
using TourPackages.Api.Dtos;
using TourPackages.Api.Models;

namespace TourPackages.Api.Services;

/// <summary>
/// Booking domain operations. Owns the rules previously inlined in
/// BookingsController (package must exist and be available; status forced to
/// Pending on creation; dates normalised to UTC).
/// </summary>
public interface IBookingService
{
    Task<BookingDto?> GetByIdAsync(int id);

    /// <summary>
    /// Returns the booking only if it belongs to the caller, or the caller is an
    /// admin; otherwise a NotFound result (hides existence from other users).
    /// </summary>
    Task<Result<BookingDto>> GetByIdForUserAsync(int id, int? userId, bool isAdmin);

    Task<IReadOnlyList<BookingDto>> GetMineAsync(int userId);

    /// <summary>A single page of the user's bookings plus the total count.</summary>
    Task<PagedResult<BookingDto>> GetMinePagedAsync(int userId, PageRequest page);

    Task<IReadOnlyList<BookingDto>> GetAllAsync(BookingStatus? status);

    /// <summary>A single page of all bookings (optionally filtered) plus the total count.</summary>
    Task<PagedResult<BookingDto>> GetAllPagedAsync(BookingStatus? status, PageRequest page);

    /// <param name="userId">The signed-in user's id from the JWT, or null.</param>
    Task<Result<BookingDto>> CreateAsync(CreateBookingDto dto, int? userId);

    Task<Result> UpdateStatusAsync(int id, BookingStatus status);
}
