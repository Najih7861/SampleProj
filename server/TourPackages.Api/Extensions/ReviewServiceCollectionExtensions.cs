using TourPackages.Api.Repositories;
using TourPackages.Api.Services;

namespace TourPackages.Api.Extensions;

/// <summary>
/// Registers the reviews &amp; ratings feature (repository + service). Net-new,
/// additive composition extension — kept separate from AddApplicationServices so
/// the feature wires itself in with a single Program.cs call and never edits the
/// shared registration file.
/// </summary>
public static class ReviewServiceCollectionExtensions
{
    public static IServiceCollection AddReviewServices(this IServiceCollection services)
    {
        services.AddScoped<IReviewRepository, ReviewRepository>();
        services.AddScoped<IReviewService, ReviewService>();
        return services;
    }
}
