using FluentValidation;
using TourPackages.Api.Dtos;

namespace TourPackages.Api.Validation;

/// <summary>
/// Shared rules for creating/updating a place. A showcase place needs at least
/// one gallery image. Generic over the DTO type so it covers both
/// CreatePlaceDto and UpdatePlaceDto without duplication.
/// </summary>
public abstract class CreatePlaceDtoValidatorBase<T> : AbstractValidator<T> where T : CreatePlaceDto
{
    protected CreatePlaceDtoValidatorBase()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("A name is required.")
            .MaximumLength(120);

        RuleFor(x => x.ImageUrls)
            .Must(urls => urls != null && urls.Any(u => !string.IsNullOrWhiteSpace(u)))
            .WithMessage("Add at least one gallery image.");

        RuleForEach(x => x.ImageUrls)
            .MaximumLength(1000).WithMessage("Image URL is too long (max 1000 characters).");
    }
}

public sealed class CreatePlaceDtoValidator : CreatePlaceDtoValidatorBase<CreatePlaceDto> { }

public sealed class UpdatePlaceDtoValidator : CreatePlaceDtoValidatorBase<UpdatePlaceDto> { }
