using System.ComponentModel.DataAnnotations;

namespace TourPackages.Api.Models;

/// <summary>
/// A single photo in a <see cref="Place"/>'s gallery. The URL is either an
/// uploaded file path (e.g. "/uploads/{guid}.jpg" served from wwwroot) or an
/// external image URL.
/// </summary>
public class PlaceImage
{
    public int Id { get; set; }

    [Required]
    public int PlaceId { get; set; }

    public Place? Place { get; set; }

    [Required]
    [MaxLength(1000)]
    public string Url { get; set; } = string.Empty;

    // Display order within the gallery (ascending).
    public int SortOrder { get; set; }
}
