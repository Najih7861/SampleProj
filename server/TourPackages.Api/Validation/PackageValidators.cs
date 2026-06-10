using FluentValidation;
using TourPackages.Api.Dtos;

namespace TourPackages.Api.Validation;

/// <summary>
/// Shared rules for creating/updating a package. Generic over the DTO type so
/// the same rules cover both CreatePackageDto and UpdatePackageDto (the latter
/// derives from the former) without duplication.
/// </summary>
public abstract class CreatePackageDtoValidatorBase<T> : AbstractValidator<T> where T : CreatePackageDto
{
    protected CreatePackageDtoValidatorBase()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("A title is required.")
            .MaximumLength(200);

        RuleFor(x => x.Destination)
            .NotEmpty().WithMessage("A destination is required.")
            .MaximumLength(120);

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price cannot be negative.");

        RuleFor(x => x.DurationDays)
            .InclusiveBetween(1, 365).WithMessage("Duration must be between 1 and 365 days.");

        RuleFor(x => x.ImageUrl)
            .MaximumLength(1000);
    }
}

public sealed class CreatePackageDtoValidator : CreatePackageDtoValidatorBase<CreatePackageDto> { }

public sealed class UpdatePackageDtoValidator : CreatePackageDtoValidatorBase<UpdatePackageDto> { }
