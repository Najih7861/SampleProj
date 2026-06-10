using FluentValidation;
using TourPackages.Api.Dtos;

namespace TourPackages.Api.Validation;

/// <summary>
/// Business rules for creating a booking, layered on top of the DTO's data
/// annotations. The headline rule annotations can't express: travel date must
/// not be in the past.
/// </summary>
public sealed class CreateBookingDtoValidator : AbstractValidator<CreateBookingDto>
{
    public CreateBookingDtoValidator()
    {
        RuleFor(x => x.TourPackageId)
            .GreaterThan(0).WithMessage("Please choose a tour package.");

        RuleFor(x => x.CustomerName)
            .NotEmpty().WithMessage("Your name is required.")
            .MaximumLength(150);

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("An email address is required.")
            .EmailAddress().WithMessage("Enter a valid email address.")
            .MaximumLength(200);

        RuleFor(x => x.Phone)
            .MaximumLength(40);

        RuleFor(x => x.TravelDate)
            .Must(date => date.Date >= DateTime.UtcNow.Date)
            .WithMessage("Travel date cannot be in the past.");

        RuleFor(x => x.NumberOfTravelers)
            .InclusiveBetween(1, 100)
            .WithMessage("Number of travelers must be between 1 and 100.");
    }
}
