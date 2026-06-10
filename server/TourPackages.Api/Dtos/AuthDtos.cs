using System.ComponentModel.DataAnnotations;
using TourPackages.Api.Models;

namespace TourPackages.Api.Dtos;

public class RegisterDto
{
    [Required, MaxLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6), MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class ForgotPasswordDto
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required, MinLength(6), MaxLength(100)]
    public string NewPassword { get; set; } = string.Empty;
}

// Returned on successful register/login. No JWT yet — kept minimal and
// extensible (a token field can be added later without breaking callers).
public record AuthUserDto(int Id, string Username, string Email, UserRole Role);
