using FluentValidation;
using TourPackages.Api.Dtos;

namespace TourPackages.Api.Validation;

/// <summary>
/// Rules for submitting a review, layered on top of the DTO data annotations.
/// Auto-discovered by the assembly scan in AddRequestValidation.
/// </summary>
public sealed class CreateReviewDtoValidator : AbstractValidator<CreateReviewDto>
{
    public CreateReviewDtoValidator()
    {
        RuleFor(x => x.TourPackageId)
            .GreaterThan(0).WithMessage("Please choose a tour package.");

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5 stars.");

        RuleFor(x => x.Comment)
            .MaximumLength(1000).WithMessage("Comment cannot exceed 1000 characters.");
    }
}
