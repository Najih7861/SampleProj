namespace TourPackages.Api.Common.Exceptions;

/// <summary>The request conflicts with current state, e.g. a duplicate (HTTP 409).</summary>
public sealed class ConflictException : AppException
{
    public ConflictException(string message)
        : base(StatusCodes.Status409Conflict, message, "Conflict") { }
}
