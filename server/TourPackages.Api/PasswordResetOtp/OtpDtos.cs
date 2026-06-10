using System.ComponentModel.DataAnnotations;

namespace TourPackages.Api.PasswordResetOtp;

// Net-new, additive DTOs for the forgot-password OTP feature. Kept in this
// feature folder (distinct from Dtos/) so the feature stays isolated.

/// <summary>Step 1: the username to send a reset code for.</summary>
public class OtpRequestDto
{
    [Required]
    public string Username { get; set; } = string.Empty;
}

/// <summary>Step 2: the username, the emailed code, and the new password.</summary>
public class OtpVerifyDto
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Otp { get; set; } = string.Empty;

    [Required, MinLength(6), MaxLength(100)]
    public string NewPassword { get; set; } = string.Empty;
}

/// <summary>Returned after a code is sent: the (masked) email and how long the code is valid.</summary>
public record OtpSentResponse(string Email, int ExpiresInSeconds);
