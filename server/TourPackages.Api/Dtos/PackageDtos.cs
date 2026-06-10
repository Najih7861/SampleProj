using System.ComponentModel.DataAnnotations;

namespace TourPackages.Api.Dtos;

public record PackageDto(
    int Id,
    string Title,
    string Destination,
    string Description,
    decimal Price,
    int DurationDays,
    string? ImageUrl,
    bool IsAvailable,
    DateTime CreatedAt);

public class CreatePackageDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(120)]
    public string Destination { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }

    [Range(1, 365)]
    public int DurationDays { get; set; }

    [MaxLength(1000)]
    public string? ImageUrl { get; set; }

    public bool IsAvailable { get; set; } = true;
}

public class UpdatePackageDto : CreatePackageDto { }
