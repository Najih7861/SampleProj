using System.ComponentModel.DataAnnotations;

namespace TourPackages.Api.Models;

public class Booking
{
    public int Id { get; set; }

    [Required]
    public int TourPackageId { get; set; }

    public TourPackage? TourPackage { get; set; }

    [Required]
    [MaxLength(150)]
    public string CustomerName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(40)]
    public string? Phone { get; set; }

    [Required]
    public DateTime TravelDate { get; set; }

    [Range(1, 100)]
    public int NumberOfTravelers { get; set; }

    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
