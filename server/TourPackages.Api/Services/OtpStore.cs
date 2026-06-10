using Microsoft.Extensions.Caching.Distributed;

namespace TourPackages.Api.Services;

/// <summary>
/// OTP store backed by <see cref="IDistributedCache"/>. When a Redis connection
/// string is configured the cache is Redis (so OTPs live in Redis with the given
/// TTL); otherwise an in-memory distributed cache is used (dev fallback).
/// </summary>
public class OtpStore : IOtpStore
{
    private readonly IDistributedCache _cache;

    public OtpStore(IDistributedCache cache) => _cache = cache;

    private static string Key(string email) => $"otp:pwreset:{email.Trim().ToLowerInvariant()}";

    public Task StoreAsync(string email, string otp, TimeSpan ttl) =>
        _cache.SetStringAsync(Key(email), otp, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = ttl
        });

    public Task<string?> RetrieveAsync(string email) => _cache.GetStringAsync(Key(email));

    public Task RemoveAsync(string email) => _cache.RemoveAsync(Key(email));
}
