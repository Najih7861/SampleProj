using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using TourPackages.Api.Auth;
using TourPackages.Api.Common.Results;
using TourPackages.Api.Data;
using TourPackages.Api.Dtos;
using TourPackages.Api.Extensions;
using TourPackages.Api.Models;
using TourPackages.Api.Services;

namespace TourPackages.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting(RateLimitingPolicies.Auth)]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtTokenService _tokens;
    private readonly IAuthService _auth;
    private static readonly PasswordHasher<User> Hasher = new();

    public AuthController(AppDbContext db, JwtTokenService tokens, IAuthService auth)
    {
        _db = db;
        _tokens = tokens;
        _auth = auth;
    }

    private AuthUserDto ToDto(User u) => new(u.Id, u.Username, u.Email, u.Role, _tokens.CreateToken(u));

    // POST /api/auth/register — every self-service registration is a User role.
    [HttpPost("register")]
    public async Task<ActionResult<AuthUserDto>> Register(RegisterDto dto)
    {
        var result = await _auth.RegisterAsync(dto);
        if (!result.IsSuccess) return result.ToErrorResult(this);
        return CreatedAtAction(nameof(Register), result.Value);
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<AuthUserDto>> Login(LoginDto dto)
    {
        var result = await _auth.LoginAsync(dto);
        return result.IsSuccess ? Ok(result.Value) : result.ToErrorResult(this);
    }

    // POST /api/auth/forgot-password  — step 1 of the OTP reset.
    // Emails a 6-digit code (stored in-memory for 5 min). Always returns 200 with
    // a generic message so it can't be used to discover registered emails.
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(RequestPasswordResetDto dto)
    {
        await _auth.RequestPasswordResetAsync(dto);
        return Ok(new { message = "If an account with that email exists, a reset code has been sent." });
    }

    // POST /api/auth/reset-password  — step 2 of the OTP reset.
    // Validates the emailed code and sets the new password.
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
    {
        var result = await _auth.ResetPasswordAsync(dto);
        if (!result.IsSuccess) return result.ToErrorResult(this);
        return Ok(new { message = "Password updated. You can now log in with your new password." });
    }
}
