using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Caching.Memory;

namespace TourPackages.Api.PasswordResetOtp;

/// <summary>
/// <see cref="IOtpCodeStore"/> backed by the framework's in-process
/// <see cref="IMemoryCache"/>. Codes expire automatically via their TTL, so no
/// external store or cleanup job is needed. Net-new, additive.
///
/// Note: codes live in the app's memory (not shared across instances / lost on
/// restart) — appropriate for a single-instance deployment.
/// </summary>
public class OtpCodeStore : IOtpCodeStore
{
    private readonly IMemoryCache _cache;

    public OtpCodeStore(IMemoryCache cache) => _cache = cache;

    private static string Key(string username) => $"pwreset-otp:{username.Trim().ToLowerInvariant()}";

    public string GenerateAndStore(string username, TimeSpan ttl)
    {
        // Cryptographically-random 6-digit code (000000–999999).
        var code = RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
        _cache.Set(Key(username), code, ttl);
        return code;
    }

    public bool Validate(string username, string otp)
    {
        if (!_cache.TryGetValue(Key(username), out string? stored) || stored is null)
            return false;

        // Constant-time comparison to avoid leaking timing information.
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(stored),
            Encoding.UTF8.GetBytes(otp.Trim()));
    }

    public void Remove(string username) => _cache.Remove(Key(username));
}
