using Microsoft.Extensions.Caching.Memory;

namespace TourPackages.Api.Services;

/// <summary>
/// OTP store backed by the framework's in-process <see cref="IMemoryCache"/>
/// (no external dependency / install). Codes expire automatically via the TTL.
///
/// Trade-off: entries live in the app's memory, so they are not shared across
/// multiple instances and are lost on restart. Fine for a single-instance
/// deployment; swap this implementation (the <see cref="IOtpStore"/> seam is
/// the only touch point) for a distributed store if you scale out.
/// </summary>
public class OtpStore : IOtpStore
{
    private readonly IMemoryCache _cache;

    public OtpStore(IMemoryCache cache) => _cache = cache;

    private static string Key(string email) => $"otp:pwreset:{email.Trim().ToLowerInvariant()}";

    public Task StoreAsync(string email, string otp, TimeSpan ttl)
    {
        _cache.Set(Key(email), otp, ttl);
        return Task.CompletedTask;
    }

    public Task<string?> RetrieveAsync(string email)
    {
        _cache.TryGetValue(Key(email), out string? otp);
        return Task.FromResult(otp);
    }

    public Task RemoveAsync(string email)
    {
        _cache.Remove(Key(email));
        return Task.CompletedTask;
    }
}
