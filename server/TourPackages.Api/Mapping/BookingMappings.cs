using TourPackages.Api.Dtos;
using TourPackages.Api.Models;

namespace TourPackages.Api.Mapping;

/// <summary>
/// Entity → DTO mapping for bookings. Mirrors the original
/// BookingsController.ToDto exactly (flattens the related package title and
/// destination). Manual, zero-dependency mapper.
/// </summary>
public static class BookingMappings
{
    public static BookingDto ToDto(this Booking b) => new(
        b.Id,
        b.TourPackageId,
        b.TourPackage?.Title ?? string.Empty,
        b.CustomerName,
        b.Email,
        b.Phone,
        b.TravelDate,
        b.NumberOfTravelers,
        b.Status,
        b.CreatedAt,
        b.TourPackage?.Destination ?? string.Empty);
}
