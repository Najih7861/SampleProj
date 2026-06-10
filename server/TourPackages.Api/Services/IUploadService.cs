using TourPackages.Api.Common.Results;

namespace TourPackages.Api.Services;

/// <summary>
/// Saves an uploaded image under wwwroot/uploads and returns its relative URL.
/// Owns the file validation rules previously inlined in UploadsController.
/// </summary>
public interface IUploadService
{
    /// <returns>Success with the relative URL (e.g. "/uploads/{guid}.jpg"), or an Invalid result.</returns>
    Task<Result<string>> SaveAsync(IFormFile? file);
}
