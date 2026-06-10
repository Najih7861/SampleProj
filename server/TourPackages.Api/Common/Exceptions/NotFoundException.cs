namespace TourPackages.Api.Common.Exceptions;

/// <summary>A requested resource does not exist (HTTP 404).</summary>
public sealed class NotFoundException : AppException
{
    public NotFoundException(string message)
        : base(StatusCodes.Status404NotFound, message, "Resource not found") { }
}
