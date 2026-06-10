using System.ComponentModel.DataAnnotations;
using TourPackages.Api.Models;

namespace TourPackages.Api.Dtos;

public record BookingDto(
    int Id,
    int TourPackageId,
    string PackageTitle,
    string CustomerName,
    string Email,
    string? Phone,
    DateTime TravelDate,
    int NumberOfTravelers,
    BookingStatus Status,
    DateTime CreatedAt,
    string PackageDestination);

public class CreateBookingDto
{
    [Required]
    public int TourPackageId { get; set; }

    [Required, MaxLength(150)]
    public string CustomerName { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(40)]
    public string? Phone { get; set; }

    [Required]
    public DateTime TravelDate { get; set; }

    [Range(1, 100)]
    public int NumberOfTravelers { get; set; } = 1;
}

public class UpdateBookingStatusDto
{
    [Required]
    public BookingStatus Status { get; set; }
}
