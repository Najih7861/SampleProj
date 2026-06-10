using FluentValidation;
using TourPackages.Api.Dtos;

namespace TourPackages.Api.Validation;

/// <summary>Shared password-strength policy for registration and password reset.</summary>
internal static class PasswordRules
{
    public static IRuleBuilderOptions<T, string> StrongPassword<T>(this IRuleBuilder<T, string> rule) =>
        rule.NotEmpty().WithMessage("A password is required.")
            .MinimumLength(8).WithMessage("Password must be at least 8 characters.")
            .MaximumLength(100)
            .Matches("[A-Za-z]").WithMessage("Password must contain at least one letter.")
            .Matches("[0-9]").WithMessage("Password must contain at least one number.");
}

public sealed class RegisterDtoValidator : AbstractValidator<RegisterDto>
{
    public RegisterDtoValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("A username is required.")
            .Length(3, 100).WithMessage("Username must be between 3 and 100 characters.")
            .Matches("^[A-Za-z0-9_.-]+$")
            .WithMessage("Username can only contain letters, numbers, and . _ -");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("An email address is required.")
            .EmailAddress().WithMessage("Enter a valid email address.")
            .MaximumLength(200);

        RuleFor(x => x.Password).StrongPassword();
    }
}

public sealed class ForgotPasswordDtoValidator : AbstractValidator<ForgotPasswordDto>
{
    public ForgotPasswordDtoValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("A username is required.");

        RuleFor(x => x.NewPassword).StrongPassword();
    }
}

public sealed class RequestPasswordResetDtoValidator : AbstractValidator<RequestPasswordResetDto>
{
    public RequestPasswordResetDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("An email address is required.")
            .EmailAddress().WithMessage("Enter a valid email address.")
            .MaximumLength(200);
    }
}

public sealed class ResetPasswordDtoValidator : AbstractValidator<ResetPasswordDto>
{
    public ResetPasswordDtoValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("An email address is required.")
            .EmailAddress().WithMessage("Enter a valid email address.");

        RuleFor(x => x.Otp)
            .NotEmpty().WithMessage("The reset code is required.")
            .Matches("^[0-9]{6}$").WithMessage("The reset code must be 6 digits.");

        RuleFor(x => x.NewPassword).StrongPassword();
    }
}
