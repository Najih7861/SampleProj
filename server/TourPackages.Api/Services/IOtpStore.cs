namespace TourPackages.Api.Services;

/// <summary>
/// Short-lived store for one-time passwords (password-reset codes), backed by a
/// distributed cache (Redis in production, in-memory in dev). Net-new, additive.
/// </summary>
public interface IOtpStore
{
    /// <summary>Stores an OTP for the given email with the supplied time-to-live.</summary>
    Task StoreAsync(string email, string otp, TimeSpan ttl);

    /// <summary>Returns the stored OTP for the email, or null if none/expired.</summary>
    Task<string?> RetrieveAsync(string email);

    /// <summary>Removes the OTP for the email (after a successful reset).</summary>
    Task RemoveAsync(string email);
}
