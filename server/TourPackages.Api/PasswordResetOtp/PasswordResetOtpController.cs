using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TourPackages.Api.Data;
using TourPackages.Api.Models;

namespace TourPackages.Api.PasswordResetOtp;

/// <summary>
/// Forgot-password via email OTP. Net-new, additive controller on its own route
/// (api/password-reset) so it does not touch the existing AuthController.
///
/// Flow:
///   POST request — look up the user by username, email a 6-digit code valid 5
///                  minutes, and return the (masked) email + validity seconds.
///   POST verify  — validate the code and set the new password.
/// </summary>
[ApiController]
[Route("api/password-reset")]
public class PasswordResetOtpController : ControllerBase
{
    private static readonly PasswordHasher<User> Hasher = new();
    private static readonly TimeSpan OtpLifetime = TimeSpan.FromMinutes(5);

    private readonly AppDbContext _db;
    private readonly IOtpCodeStore _codes;
    private readonly IOtpEmailService _email;

    public PasswordResetOtpController(AppDbContext db, IOtpCodeStore codes, IOtpEmailService email)
    {
        _db = db;
        _codes = codes;
        _email = email;
    }

    // POST /api/password-reset/request
    [HttpPost("request")]
    public async Task<ActionResult<OtpSentResponse>> RequestCode(OtpRequestDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username.Trim());
        if (user is null)
            return NotFound("No account found with that username.");

        var code = _codes.GenerateAndStore(user.Username, OtpLifetime);
        await _email.SendOtpAsync(user.Email, user.Username, code);

        return Ok(new OtpSentResponse(MaskEmail(user.Email), (int)OtpLifetime.TotalSeconds));
    }

    // POST /api/password-reset/verify
    [HttpPost("verify")]
    public async Task<IActionResult> Verify(OtpVerifyDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username.Trim());
        if (user is null)
            return NotFound("No account found with that username.");

        if (!_codes.Validate(user.Username, dto.Otp))
            return BadRequest("The code is invalid or has expired. Request a new one and try again.");

        user.PasswordHash = Hasher.HashPassword(user, dto.NewPassword);
        await _db.SaveChangesAsync();
        _codes.Remove(user.Username);

        return Ok(new { message = "Password updated. You can now log in with your new password." });
    }

    // Masks an email for display, e.g. "najih.rafeeque@gmail.com" -> "na***@gmail.com".
    private static string MaskEmail(string email)
    {
        var at = email.IndexOf('@');
        if (at <= 0) return email;

        var local = email[..at];
        var domain = email[at..];
        var visible = local.Length <= 2 ? local[..1] : local[..2];
        return $"{visible}***{domain}";
    }
}
