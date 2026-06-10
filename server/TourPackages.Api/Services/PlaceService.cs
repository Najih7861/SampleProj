using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Common.Results;
using TourPackages.Api.Dtos;
using TourPackages.Api.Mapping;
using TourPackages.Api.Models;
using TourPackages.Api.Repositories;

namespace TourPackages.Api.Services;

/// <inheritdoc />
public class PlaceService : IPlaceService
{
    private readonly IPlaceRepository _places;

    public PlaceService(IPlaceRepository places) => _places = places;

    public async Task<IReadOnlyList<PlaceDto>> GetAllAsync()
    {
        var places = await _places.ListWithDetailsAsync();
        return places.Select(p => p.ToDto()).ToList();
    }

    public async Task<PagedResult<PlaceDto>> GetPagedAsync(PageRequest page)
    {
        var result = await _places.ListWithDetailsPagedAsync(page);
        return result.Map(p => p.ToDto());
    }

    public async Task<PlaceDto?> GetByIdAsync(int id)
    {
        var place = await _places.GetByIdWithDetailsAsync(id);
        return place?.ToDto();
    }

    public async Task<PlaceDto> CreateAsync(CreatePlaceDto dto)
    {
        var place = new Place
        {
            Name = dto.Name,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow,
            Images = BuildImages(dto.ImageUrls)
        };

        _places.Add(place);
        await _places.SaveChangesAsync();
        return place.ToDto();
    }

    public async Task<Result> UpdateAsync(int id, UpdatePlaceDto dto)
    {
        var place = await _places.GetByIdWithImagesAsync(id);
        if (place is null) return Result.NotFound();

        place.Name = dto.Name;
        place.Description = dto.Description;

        // Sync the gallery: drop the old rows, add the new ordered set.
        _places.RemoveImages(place.Images);
        place.Images = BuildImages(dto.ImageUrls);

        await _places.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result> DeleteAsync(int id)
    {
        var place = await _places.GetByIdAsync(id);
        if (place is null) return Result.NotFound();

        _places.Remove(place);
        await _places.SaveChangesAsync();
        return Result.Success();
    }

    private static List<PlaceImage> BuildImages(IEnumerable<string> urls) =>
        urls.Where(u => !string.IsNullOrWhiteSpace(u))
            .Select((url, i) => new PlaceImage { Url = url.Trim(), SortOrder = i })
            .ToList();
}
