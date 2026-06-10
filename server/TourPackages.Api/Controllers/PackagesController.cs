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
public class PackagesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPackageService _packages;

    public PackagesController(AppDbContext db, IPackageService packages)
    {
        _db = db;
        _packages = packages;
    }

    private static PackageDto ToDto(TourPackage p) => new(
        p.Id, p.Title, p.Destination, p.Description, p.Price,
        p.DurationDays, p.ImageUrl, p.IsAvailable, p.CreatedAt, p.PlaceId);

    // GET /api/packages?destination=&minPrice=&maxPrice=&page=&pageSize=
    // Pagination is opt-in: omit page/pageSize to get the full list (unchanged).
    // The total matching count is always returned in the X-Total-Count header.
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PackageDto>>> GetAll(
        [FromQuery] string? destination,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int? page,
        [FromQuery] int? pageSize)
    {
        var paging = PageRequest.FromQuery(page, pageSize);
        if (paging is null)
        {
            var all = await _packages.GetAllAsync(destination, minPrice, maxPrice);
            Response.Headers[PageRequest.TotalCountHeader] = all.Count.ToString();
            return Ok(all);
        }

        var result = await _packages.GetPagedAsync(destination, minPrice, maxPrice, paging);
        Response.Headers[PageRequest.TotalCountHeader] = result.Total.ToString();
        return Ok(result.Items);
    }

    // GET /api/packages/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<PackageDto>> GetById(int id)
    {
        var package = await _packages.GetByIdAsync(id);
        return package is null ? NotFound() : Ok(package);
    }

    // POST /api/packages  (admin only)
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<PackageDto>> Create(CreatePackageDto dto)
    {
        var package = await _packages.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = package.Id }, package);
    }

    // PUT /api/packages/{id}  (admin only)
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(int id, UpdatePackageDto dto)
    {
        var result = await _packages.UpdateAsync(id, dto);
        return result.IsSuccess ? NoContent() : result.ToErrorResult(this);
    }

    // DELETE /api/packages/{id}  (admin only)
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _packages.DeleteAsync(id);
        return result.IsSuccess ? NoContent() : result.ToErrorResult(this);
    }
}
