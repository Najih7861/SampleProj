using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Common.Results;
using TourPackages.Api.Dtos;

namespace TourPackages.Api.Services;

/// <summary>Place domain operations (CRUD + gallery sync).</summary>
public interface IPlaceService
{
    Task<IReadOnlyList<PlaceDto>> GetAllAsync();

    /// <summary>A single page of places plus the total count.</summary>
    Task<PagedResult<PlaceDto>> GetPagedAsync(PageRequest page);

    Task<PlaceDto?> GetByIdAsync(int id);

    Task<PlaceDto> CreateAsync(CreatePlaceDto dto);

    Task<Result> UpdateAsync(int id, UpdatePlaceDto dto);

    Task<Result> DeleteAsync(int id);
}
