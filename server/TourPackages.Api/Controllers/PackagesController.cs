using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TourPackages.Api.Data;
using TourPackages.Api.Dtos;
using TourPackages.Api.Models;

namespace TourPackages.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PackagesController : ControllerBase
{
    private readonly AppDbContext _db;

    public PackagesController(AppDbContext db) => _db = db;

    private static PackageDto ToDto(TourPackage p) => new(
        p.Id, p.Title, p.Destination, p.Description, p.Price,
        p.DurationDays, p.ImageUrl, p.IsAvailable, p.CreatedAt);

    // GET /api/packages?destination=&minPrice=&maxPrice=
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PackageDto>>> GetAll(
        [FromQuery] string? destination,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice)
    {
        var query = _db.TourPackages.AsQueryable();

        if (!string.IsNullOrWhiteSpace(destination))
            query = query.Where(p => p.Destination.ToLower().Contains(destination.ToLower()));
        if (minPrice.HasValue)
            query = query.Where(p => p.Price >= minPrice.Value);
        if (maxPrice.HasValue)
            query = query.Where(p => p.Price <= maxPrice.Value);

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => ToDto(p))
            .ToListAsync();

        return Ok(items);
    }

    // GET /api/packages/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<PackageDto>> GetById(int id)
    {
        var p = await _db.TourPackages.FindAsync(id);
        return p is null ? NotFound() : Ok(ToDto(p));
    }

    // POST /api/packages
    [HttpPost]
    public async Task<ActionResult<PackageDto>> Create(CreatePackageDto dto)
    {
        var p = new TourPackage
        {
            Title = dto.Title,
            Destination = dto.Destination,
            Description = dto.Description,
            Price = dto.Price,
            DurationDays = dto.DurationDays,
            ImageUrl = dto.ImageUrl,
            IsAvailable = dto.IsAvailable,
            CreatedAt = DateTime.UtcNow
        };
        _db.TourPackages.Add(p);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = p.Id }, ToDto(p));
    }

    // PUT /api/packages/{id}
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdatePackageDto dto)
    {
        var p = await _db.TourPackages.FindAsync(id);
        if (p is null) return NotFound();

        p.Title = dto.Title;
        p.Destination = dto.Destination;
        p.Description = dto.Description;
        p.Price = dto.Price;
        p.DurationDays = dto.DurationDays;
        p.ImageUrl = dto.ImageUrl;
        p.IsAvailable = dto.IsAvailable;

        await _db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE /api/packages/{id}
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var p = await _db.TourPackages.FindAsync(id);
        if (p is null) return NotFound();

        _db.TourPackages.Remove(p);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
