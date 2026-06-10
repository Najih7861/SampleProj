using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using TourPackages.Api.Validation;

namespace TourPackages.Api.Extensions;

/// <summary>
/// Registers FluentValidation validators and the action filter that runs them.
/// Net-new, additive composition extension — keeps Program.cs to one call.
/// </summary>
public static class ValidationServiceCollectionExtensions
{
    public static IServiceCollection AddRequestValidation(this IServiceCollection services)
    {
        // Discover and register every IValidator<T> in this assembly (scoped).
        services.AddValidatorsFromAssemblyContaining<CreateBookingDtoValidator>(ServiceLifetime.Scoped);

        // Run them via a global action filter that emits ValidationProblemDetails.
        services.Configure<MvcOptions>(options => options.Filters.Add<FluentValidationActionFilter>());

        return services;
    }
}
