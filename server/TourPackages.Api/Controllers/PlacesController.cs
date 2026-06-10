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
public class PlacesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPlaceService _places;

    public PlacesController(AppDbContext db, IPlaceService places)
    {
        _db = db;
        _places = places;
    }

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

    // GET /api/places?page=&pageSize=  (public — drives the user Home showcase)
    // Pagination is opt-in: omit page/pageSize to get the full list (unchanged).
    // The total matching count is always returned in the X-Total-Count header.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PlaceDto>>> GetAll([FromQuery] int? page, [FromQuery] int? pageSize)
    {
        var paging = PageRequest.FromQuery(page, pageSize);
        if (paging is null)
        {
            var all = await _places.GetAllAsync();
            Response.Headers[PageRequest.TotalCountHeader] = all.Count.ToString();
            return Ok(all);
        }

        var result = await _places.GetPagedAsync(paging);
        Response.Headers[PageRequest.TotalCountHeader] = result.Total.ToString();
        return Ok(result.Items);
    }

    // GET /api/places/{id}  (public)
    [HttpGet("{id:int}")]
    public async Task<ActionResult<PlaceDto>> GetById(int id)
    {
        var place = await _places.GetByIdAsync(id);
        return place is null ? NotFound() : Ok(place);
    }

    // POST /api/places  (admin)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PlaceDto>> Create(CreatePlaceDto dto)
    {
        var place = await _places.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = place.Id }, place);
    }

    // PUT /api/places/{id}  (admin) — replaces the gallery from ImageUrls
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, UpdatePlaceDto dto)
    {
        var result = await _places.UpdateAsync(id, dto);
        return result.IsSuccess ? NoContent() : result.ToErrorResult(this);
    }

    // DELETE /api/places/{id}  (admin) — images cascade; packages keep PlaceId=null
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _places.DeleteAsync(id);
        return result.IsSuccess ? NoContent() : result.ToErrorResult(this);
    }

    private static List<PlaceImage> BuildImages(IEnumerable<string> urls) =>
        urls.Where(u => !string.IsNullOrWhiteSpace(u))
            .Select((url, i) => new PlaceImage { Url = url.Trim(), SortOrder = i })
            .ToList();
}
