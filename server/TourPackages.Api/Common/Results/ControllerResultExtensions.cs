using Microsoft.AspNetCore.Mvc;

namespace TourPackages.Api.Common.Results;

/// <summary>
/// Maps a failed <see cref="IServiceResult"/> to the matching HTTP response,
/// preserving the exact status codes and messages the controllers returned
/// before the service layer was introduced. Only called on the failure path;
/// success responses (Ok / CreatedAtAction / NoContent) stay explicit in the
/// controller so their shape is unchanged.
/// </summary>
public static class ControllerResultExtensions
{
    public static ActionResult ToErrorResult(this IServiceResult result, ControllerBase controller) =>
        result.Status switch
        {
            ResultStatus.NotFound => result.Error is null
                ? controller.NotFound()
                : controller.NotFound(result.Error),
            ResultStatus.Invalid => controller.BadRequest(result.Error),
            ResultStatus.Conflict => controller.Conflict(result.Error),
            ResultStatus.Unauthorized => result.Error is null
                ? controller.Unauthorized()
                : controller.Unauthorized(result.Error),
            // Success should never reach here; guard defensively.
            _ => controller.StatusCode(StatusCodes.Status500InternalServerError)
        };
}
