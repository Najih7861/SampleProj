using TourPackages.Api.Common.Results;

namespace TourPackages.Api.Services;

/// <inheritdoc />
public class UploadService : IUploadService
{
    private const long MaxBytes = 5 * 1024 * 1024; // 5 MB
    private static readonly HashSet<string> AllowedExt =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

    private readonly IWebHostEnvironment _env;

    public UploadService(IWebHostEnvironment env) => _env = env;

    public async Task<Result<string>> SaveAsync(IFormFile? file)
    {
        if (file is null || file.Length == 0)
            return Result<string>.Invalid("No file was uploaded.");
        if (file.Length > MaxBytes)
            return Result<string>.Invalid("File is too large (max 5 MB).");
        if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            return Result<string>.Invalid("Only image files are allowed.");

        var ext = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(ext) || !AllowedExt.Contains(ext))
            return Result<string>.Invalid("Unsupported image type.");

        // WebRootPath can be null if wwwroot doesn't exist yet — fall back to it.
        var webRoot = _env.WebRootPath ?? Path.Combine(_env.ContentRootPath, "wwwroot");
        var uploadsDir = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(uploadsDir);

        var fileName = $"{Guid.NewGuid():N}{ext.ToLowerInvariant()}";
        var fullPath = Path.Combine(uploadsDir, fileName);

        await using (var stream = File.Create(fullPath))
        {
            await file.CopyToAsync(stream);
        }

        return Result<string>.Success($"/uploads/{fileName}");
    }
}
