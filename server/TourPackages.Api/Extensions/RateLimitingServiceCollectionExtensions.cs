using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace TourPackages.Api.Extensions;

/// <summary>Named rate-limiting policies referenced by controllers.</summary>
public static class RateLimitingPolicies
{
    public const string Auth = "auth";
}

/// <summary>
/// Configures rate limiting. Net-new, additive. Currently guards the auth
/// endpoints against brute-force with a per-client-IP fixed window.
/// </summary>
public static class RateLimitingServiceCollectionExtensions
{
    public static IServiceCollection AddAuthRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            options.AddPolicy(RateLimitingPolicies.Auth, httpContext =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 10,
                        Window = TimeSpan.FromMinutes(1),
                        QueueLimit = 0
                    }));
        });

        return services;
    }
}
