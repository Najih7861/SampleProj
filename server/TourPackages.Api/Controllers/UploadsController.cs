using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TourPackages.Api.Common.Results;
using TourPackages.Api.Services;

namespace TourPackages.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UploadsController : ControllerBase
{
    private const long MaxBytes = 5 * 1024 * 1024; // 5 MB
    private static readonly HashSet<string> AllowedExt =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

    private readonly IWebHostEnvironment _env;
    private readonly IUploadService _uploads;

    public UploadsController(IWebHostEnvironment env, IUploadService uploads)
    {
        _env = env;
        _uploads = uploads;
    }

    // POST /api/uploads  (admin) — multipart form field "file".
    // Saves the image under wwwroot/uploads and returns its relative URL.
    [HttpPost]
    [RequestSizeLimit(MaxBytes)]
    public async Task<IActionResult> Upload(IFormFile? file)
    {
        var result = await _uploads.SaveAsync(file);
        if (!result.IsSuccess) return result.ToErrorResult(this);
        return Ok(new { url = result.Value });
    }
}
