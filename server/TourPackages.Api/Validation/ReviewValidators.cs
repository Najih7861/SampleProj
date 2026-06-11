using FluentValidation;
using TourPackages.Api.Dtos;

namespace TourPackages.Api.Validation;

public sealed class CreateReviewDtoValidator : AbstractValidator<CreateReviewDto>
{
    public CreateReviewDtoValidator()
    {
        RuleFor(review => review.TourPackageId)
            .GreaterThan(0).WithMessage("A tour package is required.");

        RuleFor(review => review.Rating)
            .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5.");

        RuleFor(review => review.Comment)
            .MaximumLength(1000);
    }
}
