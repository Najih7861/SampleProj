using System.ComponentModel.DataAnnotations;

namespace TourPackages.Api.Dtos;

public record ReviewDto(
    int Id,
    int TourPackageId,
    int UserId,
    string Username,
    int Rating,
    string? Comment,
    DateTime CreatedAt);

public class CreateReviewDto
{
    [Required]
    public int TourPackageId { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }
}

public record ReviewSummaryDto(double AverageRating, int ReviewCount);
