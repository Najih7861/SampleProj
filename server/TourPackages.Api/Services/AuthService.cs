using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using TourPackages.Api.Auth;
using TourPackages.Api.Common.Results;
using TourPackages.Api.Dtos;
using TourPackages.Api.Models;
using TourPackages.Api.Repositories;

namespace TourPackages.Api.Services;

/// <inheritdoc />
public class AuthService : IAuthService
{
    private static readonly PasswordHasher<User> Hasher = new();
    private static readonly TimeSpan OtpLifetime = TimeSpan.FromMinutes(5);

    private readonly IUserRepository _users;
    private readonly JwtTokenService _tokens;
    private readonly IOtpStore _otpStore;
    private readonly IEmailSender _emailSender;

    public AuthService(IUserRepository users, JwtTokenService tokens, IOtpStore otpStore, IEmailSender emailSender)
    {
        _users = users;
        _tokens = tokens;
        _otpStore = otpStore;
        _emailSender = emailSender;
    }

    private AuthUserDto ToDto(User u) => new(u.Id, u.Username, u.Email, u.Role, _tokens.CreateToken(u));

    public async Task<Result<AuthUserDto>> RegisterAsync(RegisterDto dto)
    {
        var username = dto.Username.Trim();
        var email = dto.Email.Trim();

        if (await _users.UsernameExistsAsync(username))
            return Result<AuthUserDto>.Conflict("That username is already taken.");
        if (await _users.EmailExistsAsync(email))
            return Result<AuthUserDto>.Conflict("An account with that email already exists.");

        var user = new User
        {
            Username = username,
            Email = email,
            Role = UserRole.User, // app registrations are always plain users
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = Hasher.HashPassword(user, dto.Password);

        _users.Add(user);
        await _users.SaveChangesAsync();

        return Result<AuthUserDto>.Success(ToDto(user));
    }

    public async Task<Result<AuthUserDto>> LoginAsync(LoginDto dto)
    {
        var user = await _users.GetByUsernameAsync(dto.Username.Trim());
        if (user is null)
            return Result<AuthUserDto>.Unauthorized("Invalid username or password.");

        var result = Hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        if (result == PasswordVerificationResult.Failed)
            return Result<AuthUserDto>.Unauthorized("Invalid username or password.");

        return Result<AuthUserDto>.Success(ToDto(user));
    }

    // Obsolete one-step reset, retained for backward compatibility but no longer
    // routed (it allowed resetting any account by username — an account-takeover
    // hole). The OTP flow below replaces it. Safe to delete in a future cleanup.
    public async Task<Result> ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var user = await _users.GetByUsernameAsync(dto.Username.Trim());
        if (user is null)
            return Result.NotFound("No account found with that username.");

        user.PasswordHash = Hasher.HashPassword(user, dto.NewPassword);
        await _users.SaveChangesAsync();
        return Result.Success();
    }

    public async Task<Result> RequestPasswordResetAsync(RequestPasswordResetDto dto)
    {
        var email = dto.Email.Trim();
        var user = await _users.GetByEmailAsync(email);

        // Only send a code if the account exists, but always report success so
        // the response can't be used to discover which emails are registered.
        if (user is not null)
        {
            var otp = GenerateOtp();
            await _otpStore.StoreAsync(email, otp, OtpLifetime);
            await _emailSender.SendAsync(
                email,
                "Your Wanderlust password reset code",
                $"Your password reset code is {otp}. It expires in 5 minutes. " +
                "If you didn't request a reset, you can safely ignore this email.");
        }

        return Result.Success();
    }

    public async Task<Result> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var email = dto.Email.Trim();

        var storedOtp = await _otpStore.RetrieveAsync(email);
        if (storedOtp is null || !OtpMatches(storedOtp, dto.Otp.Trim()))
            return Result.Invalid("The reset code is invalid or has expired.");

        var user = await _users.GetByEmailAsync(email);
        if (user is null)
            return Result.Invalid("The reset code is invalid or has expired.");

        user.PasswordHash = Hasher.HashPassword(user, dto.NewPassword);
        await _users.SaveChangesAsync();

        // One-shot: invalidate the code once used.
        await _otpStore.RemoveAsync(email);
        return Result.Success();
    }

    private static string GenerateOtp() =>
        RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");

    private static bool OtpMatches(string stored, string provided) =>
        CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(stored),
            Encoding.UTF8.GetBytes(provided));
}
