using TourPackages.Api.Common.Results;
using TourPackages.Api.Dtos;

namespace TourPackages.Api.Services;

/// <summary>
/// Authentication domain operations. Owns username/email uniqueness checks,
/// password hashing/verification, and JWT issuance.
/// </summary>
public interface IAuthService
{
    Task<Result<AuthUserDto>> RegisterAsync(RegisterDto dto);

    Task<Result<AuthUserDto>> LoginAsync(LoginDto dto);

    /// <summary>
    /// Obsolete one-step reset. Superseded by the OTP flow
    /// (<see cref="RequestPasswordResetAsync"/> + <see cref="ResetPasswordAsync"/>)
    /// and no longer routed. Retained only for backward compatibility.
    /// </summary>
    Task<Result> ForgotPasswordAsync(ForgotPasswordDto dto);

    /// <summary>Step 1: generate an OTP, store it (5 min), and email it to the account.</summary>
    Task<Result> RequestPasswordResetAsync(RequestPasswordResetDto dto);

    /// <summary>Step 2: validate the OTP and set the new password.</summary>
    Task<Result> ResetPasswordAsync(ResetPasswordDto dto);
}
