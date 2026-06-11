using System.ComponentModel.DataAnnotations;

namespace TourPackages.Api.Models;

/// <summary>A star rating and optional comment left by a signed-in non-admin user.</summary>
public class Review
{
    public int Id { get; set; }

    [Required]
    public int TourPackageId { get; set; }

    public TourPackage? TourPackage { get; set; }

    [Required]
    public int UserId { get; set; }

    public User? User { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string? Comment { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
