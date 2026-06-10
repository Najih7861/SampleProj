namespace TourPackages.Api.Common.Exceptions;

/// <summary>
/// Base class for intentional, expected domain/HTTP errors. The global
/// exception handler maps these to their <see cref="StatusCode"/> and surfaces
/// the message in the ProblemDetails response. Unexpected exceptions instead
/// become a generic 500 with no internal detail leaked.
///
/// Net-new, additive. Services may throw these where that reads more naturally
/// than returning a <see cref="Common.Results.Result"/>; both styles coexist.
/// </summary>
public abstract class AppException : Exception
{
    protected AppException(int statusCode, string message, string? title = null) : base(message)
    {
        StatusCode = statusCode;
        Title = title;
    }

    public int StatusCode { get; }

    public string? Title { get; }
}
