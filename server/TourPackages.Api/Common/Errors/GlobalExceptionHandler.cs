using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using TourPackages.Api.Common.Exceptions;

namespace TourPackages.Api.Common.Errors;

/// <summary>
/// Catches any exception that escapes the pipeline and writes a consistent
/// RFC 7807 ProblemDetails response instead of a raw error page / stack trace.
///
/// - Intentional <see cref="AppException"/>s map to their declared status code
///   and surface their message.
/// - Anything else is logged at Error and returned as a generic 500 with no
///   internal detail, so implementation details never leak to clients.
///
/// Net-new, additive. Registered via AddExceptionHandler + AddProblemDetails
/// and wired with app.UseExceptionHandler() in Program.cs.
/// </summary>
public sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly IProblemDetailsService _problemDetailsService;
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(
        IProblemDetailsService problemDetailsService,
        ILogger<GlobalExceptionHandler> logger)
    {
        _problemDetailsService = problemDetailsService;
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var statusCode = exception is AppException appEx
            ? appEx.StatusCode
            : StatusCodes.Status500InternalServerError;

        if (statusCode >= StatusCodes.Status500InternalServerError)
            _logger.LogError(exception, "Unhandled exception processing {Method} {Path}",
                httpContext.Request.Method, httpContext.Request.Path);
        else
            _logger.LogWarning(exception, "Request failed: {Message}", exception.Message);

        httpContext.Response.StatusCode = statusCode;

        return await _problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ProblemDetails
            {
                Status = statusCode,
                Title = exception is AppException domainEx
                    ? domainEx.Title ?? "Request error"
                    : "An unexpected error occurred.",
                // Only surface the message for intentional domain exceptions;
                // never leak internals on an unexpected 500.
                Detail = exception is AppException ? exception.Message : null
            }
        });
    }
}
