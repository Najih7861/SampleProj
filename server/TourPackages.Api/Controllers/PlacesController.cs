using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TourPackages.Api.Data;
using TourPackages.Api.Dtos;
using TourPackages.Api.Models;

namespace TourPackages.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlacesController : ControllerBase
{
    private readonly AppDbContext _db;

    public PlacesController(AppDbContext db) => _db = db;

    private static PlaceDto ToDto(Place p) => new(
        p.Id,
        p.Name,
        p.Description,
        p.CreatedAt,
        p.Images.OrderBy(i => i.SortOrder).Select(i => i.Url).ToList(),
        p.Packages
            .OrderBy(pk => pk.Id)
            .Select(pk => new PlacePackageDto(pk.Id, pk.Title, pk.Price, pk.DurationDays, pk.IsAvailable))
            .ToList());

    // GET /api/places  (public — drives the user Home showcase)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PlaceDto>>> GetAll()
    {
        var places = await _db.Places
            .Include(p => p.Images)
            .Include(p => p.Packages)
            .OrderBy(p => p.Id)
            .ToListAsync();

        return Ok(places.Select(ToDto));
    }

    // GET /api/places/{id}  (public)
    [HttpGet("{id:int}")]
    public async Task<ActionResult<PlaceDto>> GetById(int id)
    {
        var place = await _db.Places
            .Include(p => p.Images)
            .Include(p => p.Packages)
            .FirstOrDefaultAsync(p => p.Id == id);

        return place is null ? NotFound() : Ok(ToDto(place));
    }

    // POST /api/places  (admin)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PlaceDto>> Create(CreatePlaceDto dto)
    {
        var place = new Place
        {
            Name = dto.Name,
            Description = dto.Description,
            CreatedAt = DateTime.UtcNow,
            Images = BuildImages(dto.ImageUrls)
        };

        _db.Places.Add(place);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = place.Id }, ToDto(place));
    }

    // PUT /api/places/{id}  (admin) — replaces the gallery from ImageUrls
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, UpdatePlaceDto dto)
    {
        var place = await _db.Places.Include(p => p.Images).FirstOrDefaultAsync(p => p.Id == id);
        if (place is null) return NotFound();

        place.Name = dto.Name;
        place.Description = dto.Description;

        // Sync the gallery: drop the old rows, add the new ordered set.
        _db.PlaceImages.RemoveRange(place.Images);
        place.Images = BuildImages(dto.ImageUrls);

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/places/{id}  (admin) — images cascade; packages keep PlaceId=null
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var place = await _db.Places.FindAsync(id);
        if (place is null) return NotFound();

        _db.Places.Remove(place);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static List<PlaceImage> BuildImages(IEnumerable<string> urls) =>
        urls.Where(u => !string.IsNullOrWhiteSpace(u))
            .Select((url, i) => new PlaceImage { Url = url.Trim(), SortOrder = i })
            .ToList();
}
