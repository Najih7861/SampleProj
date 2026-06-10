using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TourPackages.Api.Auth;
using TourPackages.Api.Data;
using TourPackages.Api.Dtos;
using TourPackages.Api.Models;

namespace TourPackages.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtTokenService _tokens;
    private static readonly PasswordHasher<User> Hasher = new();

    public AuthController(AppDbContext db, JwtTokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    private AuthUserDto ToDto(User u) => new(u.Id, u.Username, u.Email, u.Role, _tokens.CreateToken(u));

    // POST /api/auth/register — every self-service registration is a User role.
    [HttpPost("register")]
    public async Task<ActionResult<AuthUserDto>> Register(RegisterDto dto)
    {
        var username = dto.Username.Trim();
        var email = dto.Email.Trim();

        if (await _db.Users.AnyAsync(u => u.Username == username))
            return Conflict("That username is already taken.");
        if (await _db.Users.AnyAsync(u => u.Email == email))
            return Conflict("An account with that email already exists.");

        var user = new User
        {
            Username = username,
            Email = email,
            Role = UserRole.User, // app registrations are always plain users
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = Hasher.HashPassword(user, dto.Password);

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(Register), ToDto(user));
    }

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult<AuthUserDto>> Login(LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username.Trim());
        if (user is null)
            return Unauthorized("Invalid username or password.");

        var result = Hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
        if (result == PasswordVerificationResult.Failed)
            return Unauthorized("Invalid username or password.");

        return Ok(ToDto(user));
    }

    // POST /api/auth/forgot-password
    // Simplified demo flow: resets the password directly for a known username.
    // (A production flow would email a time-limited reset token instead.)
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username.Trim());
        if (user is null)
            return NotFound("No account found with that username.");

        user.PasswordHash = Hasher.HashPassword(user, dto.NewPassword);
        await _db.SaveChangesAsync();
        return Ok(new { message = "Password updated. You can now log in with your new password." });
    }
}
