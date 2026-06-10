using System.ComponentModel.DataAnnotations;

namespace TourPackages.Api.Dtos;

/// <summary>
/// Step 1 of the OTP password reset: the account email to send a reset code to.
/// Net-new, additive — replaces the old one-step ForgotPasswordDto flow.
/// </summary>
public class RequestPasswordResetDto
{
    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;
}

/// <summary>
/// Step 2 of the OTP password reset: the email, the emailed code, and the new
/// password. The code is validated against the one stored in the OTP store.
/// </summary>
public class ResetPasswordDto
{
    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Otp { get; set; } = string.Empty;

    [Required, MinLength(8), MaxLength(100)]
    public string NewPassword { get; set; } = string.Empty;
}
