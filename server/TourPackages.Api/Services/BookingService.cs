using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Common.Results;
using TourPackages.Api.Dtos;
using TourPackages.Api.Mapping;
using TourPackages.Api.Models;
using TourPackages.Api.Repositories;

namespace TourPackages.Api.Services;

/// <inheritdoc />
public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookings;
    private readonly IPackageRepository _packages;

    public BookingService(IBookingRepository bookings, IPackageRepository packages)
    {
        _bookings = bookings;
        _packages = packages;
    }

    public async Task<BookingDto?> GetByIdAsync(int id)
    {
        var booking = await _bookings.GetByIdWithPackageAsync(id);
        return booking?.ToDto();
    }

    public async Task<Result<BookingDto>> GetByIdForUserAsync(int id, int? userId, bool isAdmin)
    {
        var booking = await _bookings.GetByIdWithPackageAsync(id);
        if (booking is null)
            return Result<BookingDto>.NotFound();

        // Owner or admin only; otherwise hide existence behind a 404.
        if (!isAdmin && booking.UserId != userId)
            return Result<BookingDto>.NotFound();

        return Result<BookingDto>.Success(booking.ToDto());
    }

    public async Task<IReadOnlyList<BookingDto>> GetMineAsync(int userId)
    {
        var items = await _bookings.ListByUserAsync(userId);
        return items.Select(b => b.ToDto()).ToList();
    }

    public async Task<PagedResult<BookingDto>> GetMinePagedAsync(int userId, PageRequest page)
    {
        var result = await _bookings.ListByUserPagedAsync(userId, page);
        return result.Map(b => b.ToDto());
    }

    public async Task<IReadOnlyList<BookingDto>> GetAllAsync(BookingStatus? status)
    {
        var items = await _bookings.ListAsync(status);
        return items.Select(b => b.ToDto()).ToList();
    }

    public async Task<PagedResult<BookingDto>> GetAllPagedAsync(BookingStatus? status, PageRequest page)
    {
        var result = await _bookings.ListPagedAsync(status, page);
        return result.Map(b => b.ToDto());
    }

    public async Task<Result<BookingDto>> CreateAsync(CreateBookingDto dto, int? userId)
    {
        var package = await _packages.GetByIdAsync(dto.TourPackageId);
        if (package is null)
            return Result<BookingDto>.Invalid($"Tour package {dto.TourPackageId} does not exist.");
        if (!package.IsAvailable)
            return Result<BookingDto>.Invalid("This tour package is not currently available for booking.");

        var booking = new Booking
        {
            TourPackageId = dto.TourPackageId,
            CustomerName = dto.CustomerName,
            Email = dto.Email,
            Phone = dto.Phone,
            // PostgreSQL timestamptz requires UTC — see CLAUDE.md.
            TravelDate = DateTime.SpecifyKind(dto.TravelDate, DateTimeKind.Utc),
            NumberOfTravelers = dto.NumberOfTravelers,
            // Status is forced server-side regardless of input.
            Status = BookingStatus.Pending,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _bookings.Add(booking);
        await _bookings.SaveChangesAsync();

        // Attach the package so the DTO can flatten its title/destination.
        booking.TourPackage = package;
        return Result<BookingDto>.Success(booking.ToDto());
    }

    public async Task<Result> UpdateStatusAsync(int id, BookingStatus status)
    {
        var booking = await _bookings.GetByIdAsync(id);
        if (booking is null) return Result.NotFound();

        booking.Status = status;
        await _bookings.SaveChangesAsync();
        return Result.Success();
    }
}
