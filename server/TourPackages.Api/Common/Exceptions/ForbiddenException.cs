namespace TourPackages.Api.Common.Exceptions;

/// <summary>The caller is authenticated but not allowed to perform this action (HTTP 403).</summary>
public sealed class ForbiddenException : AppException
{
    public ForbiddenException(string message = "You are not allowed to perform this action.")
        : base(StatusCodes.Status403Forbidden, message, "Forbidden") { }
}
