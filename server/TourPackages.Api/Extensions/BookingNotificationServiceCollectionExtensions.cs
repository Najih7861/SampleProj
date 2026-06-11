using TourPackages.Api.Services;

namespace TourPackages.Api.Extensions;

/// <summary>
/// Registers booking notification emails. Net-new, additive composition
/// extension. Must be called AFTER AddApplicationServices so the decorator can
/// wrap the already-registered BookingService.
/// </summary>
public static class BookingNotificationServiceCollectionExtensions
{
    public static IServiceCollection AddBookingNotifications(this IServiceCollection services)
    {
        services.AddScoped<IBookingEmailService, BookingEmailService>();

        // Decorate IBookingService without modifying it: register the concrete
        // BookingService so the decorator can wrap it, then re-register the
        // interface as the decorator (last registration wins for resolution).
        services.AddScoped<BookingService>();
        services.AddScoped<IBookingService>(sp => new BookingNotifyingBookingService(
            sp.GetRequiredService<BookingService>(),
            sp.GetRequiredService<IBookingEmailService>()));

        return services;
    }
}
