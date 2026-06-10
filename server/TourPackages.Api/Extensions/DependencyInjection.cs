using TourPackages.Api.Repositories;
using TourPackages.Api.Services;

namespace TourPackages.Api.Extensions;

/// <summary>
/// Registers the repository and service layers. Net-new, additive composition
/// root extension — keeps Program.cs to a single registration call.
/// </summary>
public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Repositories (data access over AppDbContext).
        services.AddScoped<IBookingRepository, BookingRepository>();
        services.AddScoped<IPackageRepository, PackageRepository>();
        services.AddScoped<IPlaceRepository, PlaceRepository>();
        services.AddScoped<IUserRepository, UserRepository>();

        // Domain services (business rules).
        services.AddScoped<IBookingService, BookingService>();
        services.AddScoped<IPackageService, PackageService>();
        services.AddScoped<IPlaceService, PlaceService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUploadService, UploadService>();

        return services;
    }
}
