using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Models;

namespace TourPackages.Api.Repositories;

/// <summary>
/// Data access for places and their galleries. Net-new, additive abstraction
/// over AppDbContext.
/// </summary>
public interface IPlaceRepository
{
    /// <summary>All places with images and grouped packages, ordered by id.</summary>
    Task<List<Place>> ListWithDetailsAsync();

    /// <summary>A single page of places (with details) plus the total count.</summary>
    Task<PagedResult<Place>> ListWithDetailsPagedAsync(PageRequest page);

    /// <summary>A place with images and grouped packages.</summary>
    Task<Place?> GetByIdWithDetailsAsync(int id);

    /// <summary>A place with only its images (used when replacing the gallery).</summary>
    Task<Place?> GetByIdWithImagesAsync(int id);

    /// <summary>A place by id (no related data).</summary>
    Task<Place?> GetByIdAsync(int id);

    void Add(Place place);

    void Remove(Place place);

    /// <summary>Removes the given gallery image rows (used to sync a gallery).</summary>
    void RemoveImages(IEnumerable<PlaceImage> images);

    Task<int> SaveChangesAsync();
}
