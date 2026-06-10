using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Common.Results;
using TourPackages.Api.Data;
using TourPackages.Api.Dtos;
using TourPackages.Api.Models;
using TourPackages.Api.Services;

namespace TourPackages.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IBookingService _bookings;

    public BookingsController(AppDbContext db, IBookingService bookings)
    {
        _db = db;
        _bookings = bookings;
    }

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
        var result = await _bookings.CreateAsync(dto, CurrentUserId());
        if (!result.IsSuccess) return result.ToErrorResult(this);
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    // GET /api/bookings/{id}
    [HttpGet("{id:int}")]
    [Authorize]
    public async Task<ActionResult<BookingDto>> GetById(int id)
    {
        // Only the booking's owner (or an admin) may view it.
        var result = await _bookings.GetByIdForUserAsync(id, CurrentUserId(), User.IsInRole("Admin"));
        return result.IsSuccess ? Ok(result.Value) : result.ToErrorResult(this);
    }

    // GET /api/bookings/mine?page=&pageSize=  (the signed-in user's own bookings)
    // Pagination is opt-in; the total count is returned in the X-Total-Count header.
    [HttpGet("mine")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<BookingDto>>> GetMine([FromQuery] int? page, [FromQuery] int? pageSize)
    {
        var userId = CurrentUserId();
        if (userId is null) return Unauthorized();

        var paging = PageRequest.FromQuery(page, pageSize);
        if (paging is null)
        {
            var all = await _bookings.GetMineAsync(userId.Value);
            Response.Headers[PageRequest.TotalCountHeader] = all.Count.ToString();
            return Ok(all);
        }

        var result = await _bookings.GetMinePagedAsync(userId.Value, paging);
        Response.Headers[PageRequest.TotalCountHeader] = result.Total.ToString();
        return Ok(result.Items);
    }

    // GET /api/bookings?status=&page=&pageSize=  (admin: all bookings)
    // Pagination is opt-in; the total count is returned in the X-Total-Count header.
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IEnumerable<BookingDto>>> GetAll(
        [FromQuery] BookingStatus? status,
        [FromQuery] int? page,
        [FromQuery] int? pageSize)
    {
        var paging = PageRequest.FromQuery(page, pageSize);
        if (paging is null)
        {
            var all = await _bookings.GetAllAsync(status);
            Response.Headers[PageRequest.TotalCountHeader] = all.Count.ToString();
            return Ok(all);
        }

        var result = await _bookings.GetAllPagedAsync(status, paging);
        Response.Headers[PageRequest.TotalCountHeader] = result.Total.ToString();
        return Ok(result.Items);
    }

    // PUT /api/bookings/{id}/status  (admin)
    [HttpPut("{id:int}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateBookingStatusDto dto)
    {
        var result = await _bookings.UpdateStatusAsync(id, dto.Status);
        return result.IsSuccess ? NoContent() : result.ToErrorResult(this);
    }
}
