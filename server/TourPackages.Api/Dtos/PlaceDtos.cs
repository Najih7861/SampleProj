using System.ComponentModel.DataAnnotations;

namespace TourPackages.Api.Dtos;

// A place plus its ordered gallery URLs and the packages grouped under it.
public record PlaceDto(
    int Id,
    string Name,
    string Description,
    DateTime CreatedAt,
    IReadOnlyList<string> Images,
    IReadOnlyList<PlacePackageDto> Packages);

// Lightweight package summary used by the Home "Book Now" cards.
public record PlacePackageDto(
    int Id,
    string Title,
    decimal Price,
    int DurationDays,
    bool IsAvailable);

public class CreatePlaceDto
{
    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    // Gallery photo URLs in display order (uploaded via POST /api/uploads or
    // pasted external URLs). The controller syncs PlaceImage rows from this.
    public List<string> ImageUrls { get; set; } = new();
}

public class UpdatePlaceDto : CreatePlaceDto { }
