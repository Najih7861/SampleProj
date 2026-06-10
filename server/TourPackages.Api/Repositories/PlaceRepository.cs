using Microsoft.EntityFrameworkCore;
using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Data;
using TourPackages.Api.Models;

namespace TourPackages.Api.Repositories;

/// <inheritdoc />
public class PlaceRepository : IPlaceRepository
{
    private readonly AppDbContext _db;

    public PlaceRepository(AppDbContext db) => _db = db;

    public Task<List<Place>> ListWithDetailsAsync() =>
        _db.Places
            .Include(p => p.Images)
            .Include(p => p.Packages)
            .OrderBy(p => p.Id)
            .ToListAsync();

    public Task<PagedResult<Place>> ListWithDetailsPagedAsync(PageRequest page) =>
        _db.Places
            .Include(p => p.Images)
            .Include(p => p.Packages)
            .OrderBy(p => p.Id)
            .ToPagedResultAsync(page);

    public Task<Place?> GetByIdWithDetailsAsync(int id) =>
        _db.Places
            .Include(p => p.Images)
            .Include(p => p.Packages)
            .FirstOrDefaultAsync(p => p.Id == id);

    public Task<Place?> GetByIdWithImagesAsync(int id) =>
        _db.Places.Include(p => p.Images).FirstOrDefaultAsync(p => p.Id == id);

    public Task<Place?> GetByIdAsync(int id) =>
        _db.Places.FindAsync(id).AsTask();

    public void Add(Place place) => _db.Places.Add(place);

    public void Remove(Place place) => _db.Places.Remove(place);

    public void RemoveImages(IEnumerable<PlaceImage> images) => _db.PlaceImages.RemoveRange(images);

    public Task<int> SaveChangesAsync() => _db.SaveChangesAsync();
}
