using System.ComponentModel.DataAnnotations;

namespace TourPackages.Api.Models;

public class TourPackage
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(120)]
    public string Destination { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Range(1, 365)]
    public int DurationDays { get; set; }

    [MaxLength(1000)]
    public string? ImageUrl { get; set; }

    public bool IsAvailable { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Optional link to the Place this package belongs to (additive; nullable so
    // existing packages remain valid). See Place / PlaceImage.
    public int? PlaceId { get; set; }

    public Place? Place { get; set; }

    public List<Booking> Bookings { get; set; } = new();
}
