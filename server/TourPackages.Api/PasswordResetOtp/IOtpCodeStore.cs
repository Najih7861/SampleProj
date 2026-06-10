namespace TourPackages.Api.PasswordResetOtp;

/// <summary>
/// Generates and validates short-lived password-reset OTP codes, keyed by
/// username. Net-new, additive — backed by an in-process cache (no install).
/// </summary>
public interface IOtpCodeStore
{
    /// <summary>Generates a 6-digit code for the username and stores it for <paramref name="ttl"/>.</summary>
    string GenerateAndStore(string username, TimeSpan ttl);

    /// <summary>True if the supplied code matches the stored, unexpired code for the username.</summary>
    bool Validate(string username, string otp);

    /// <summary>Removes the stored code for the username (after a successful reset).</summary>
    void Remove(string username);
}
