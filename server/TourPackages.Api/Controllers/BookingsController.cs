using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TourPackages.Api.Data;
using TourPackages.Api.Dtos;
using TourPackages.Api.Models;

namespace TourPackages.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public BookingsController(AppDbContext db) => _db = db;

    private static BookingDto ToDto(Booking b) => new(
        b.Id, b.TourPackageId, b.TourPackage?.Title ?? string.Empty,
        b.CustomerName, b.Email, b.Phone, b.TravelDate,
        b.NumberOfTravelers, b.Status, b.CreatedAt,
        b.TourPackage?.Destination ?? string.Empty);

    // Reads the user id from the JWT "sub"/NameIdentifier claim.
    private int? CurrentUserId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? User.FindFirstValue("sub");
        return int.TryParse(raw, out var id) ? id : null;
    }

    // POST /api/bookings  (signed-in user creates a booking — login required)
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<BookingDto>> Create(CreateBookingDto dto)
    {
        var package = await _db.TourPackages.FindAsync(dto.TourPackageId);
        if (package is null)
            return BadRequest($"Tour package {dto.TourPackageId} does not exist.");
        if (!package.IsAvailable)
            return BadRequest("This tour package is not currently available for booking.");

        var booking = new Booking
        {
            TourPackageId = dto.TourPackageId,
            CustomerName = dto.CustomerName,
            Email = dto.Email,
            Phone = dto.Phone,
            TravelDate = DateTime.SpecifyKind(dto.TravelDate, DateTimeKind.Utc),
            NumberOfTravelers = dto.NumberOfTravelers,
            Status = BookingStatus.Pending,
            UserId = CurrentUserId(),
            CreatedAt = DateTime.UtcNow
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();

        booking.TourPackage = package;
        return CreatedAtAction(nameof(GetById), new { id = booking.Id }, ToDto(booking));
    }

    // GET /api/bookings/{id}
    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<ActionResult<BookingDto>> GetById(int id)
    {
        var b = await _db.Bookings.Include(x => x.TourPackage).FirstOrDefaultAsync(x => x.Id == id);
        return b is null ? NotFound() : Ok(ToDto(b));
    }

    // GET /api/bookings/mine  (the signed-in user's own bookings)
    [HttpGet("mine")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<BookingDto>>> GetMine()
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        var items = await _db.Bookings
            .Include(b => b.TourPackage)
            .Where(b => b.UserId == userId)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => ToDto(b))
            .ToListAsync();

        return Ok(items);
    }

    // GET /api/bookings?status=  (admin: all bookings)
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<BookingDto>>> GetAll([FromQuery] BookingStatus? status)
    {
        var query = _db.Bookings.Include(b => b.TourPackage).AsQueryable();
        if (status.HasValue)
            query = query.Where(b => b.Status == status.Value);

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => ToDto(b))
            .ToListAsync();

        return Ok(items);
    }

    // PUT /api/bookings/{id}/status  (admin)
    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateBookingStatusDto dto)
    {
        var b = await _db.Bookings.FindAsync(id);
        if (b is null) return NotFound();

        b.Status = dto.Status;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
