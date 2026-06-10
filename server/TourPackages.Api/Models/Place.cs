using System.ComponentModel.DataAnnotations;

namespace TourPackages.Api.Models;

/// <summary>
/// A destination/place shown on the user Home page. Groups one or more tour
/// packages and owns a gallery of photos (see <see cref="PlaceImage"/>) used
/// for the auto-advancing slideshow. Net-new entity — additive to the schema.
/// </summary>
public class Place
{
    public int Id { get; set; }

    [Required]
    [MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Gallery photos for the slideshow (ordered by SortOrder).
    public List<PlaceImage> Images { get; set; } = new();

    // Packages grouped under this place (optional link; see TourPackage.PlaceId).
    public List<TourPackage> Packages { get; set; } = new();
}
