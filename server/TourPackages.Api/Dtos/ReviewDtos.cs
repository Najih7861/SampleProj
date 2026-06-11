using System.ComponentModel.DataAnnotations;

namespace TourPackages.Api.Dtos;

/// <summary>A review as returned by the API (flattens the author's username).</summary>
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

/// <summary>Aggregate rating for a package (average is 0 when there are none).</summary>
public record ReviewSummaryDto(double AverageRating, int ReviewCount);
