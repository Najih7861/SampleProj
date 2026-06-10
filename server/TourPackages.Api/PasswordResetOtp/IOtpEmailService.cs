namespace TourPackages.Api.PasswordResetOtp;

/// <summary>
/// Sends the password-reset OTP code to a user's email. Net-new, additive.
/// Implemented by <see cref="SmtpOtpEmailService"/> (real SMTP) or
/// <see cref="LogOtpEmailService"/> (dev fallback that logs the code).
/// </summary>
public interface IOtpEmailService
{
    Task SendOtpAsync(string toEmail, string username, string otp);
}
