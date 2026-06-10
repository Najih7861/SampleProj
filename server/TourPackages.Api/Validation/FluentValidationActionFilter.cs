using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace TourPackages.Api.Validation;

/// <summary>
/// Runs any registered FluentValidation <see cref="IValidator{T}"/> against the
/// action's arguments and, on failure, short-circuits with the framework's
/// standard <c>ValidationProblemDetails</c> (HTTP 400) — the same shape
/// <c>[ApiController]</c> produces for data-annotation failures, so clients see
/// one consistent error format.
///
/// Net-new, additive. Registered globally via AddRequestValidation(). Runs
/// after the built-in ModelState check, so data-annotation failures still
/// short-circuit first; this layer adds the richer business rules on top.
/// </summary>
public sealed class FluentValidationActionFilter : IAsyncActionFilter
{
    private readonly ProblemDetailsFactory _problemDetailsFactory;

    public FluentValidationActionFilter(ProblemDetailsFactory problemDetailsFactory)
        => _problemDetailsFactory = problemDetailsFactory;

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var services = context.HttpContext.RequestServices;

        foreach (var argument in context.ActionArguments.Values)
        {
            if (argument is null) continue;

            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());
            if (services.GetService(validatorType) is not IValidator validator) continue;

            var result = await validator.ValidateAsync(new ValidationContext<object>(argument));
            foreach (var failure in result.Errors)
                context.ModelState.AddModelError(failure.PropertyName, failure.ErrorMessage);
        }

        if (!context.ModelState.IsValid)
        {
            var problemDetails = _problemDetailsFactory.CreateValidationProblemDetails(
                context.HttpContext, context.ModelState);

            context.Result = new ObjectResult(problemDetails)
            {
                StatusCode = problemDetails.Status ?? StatusCodes.Status400BadRequest,
                ContentTypes = { "application/problem+json" }
            };
            return;
        }

        await next();
    }
}
