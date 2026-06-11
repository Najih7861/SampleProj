using TourPackages.Api.PasswordResetOtp;
using TourPackages.Api.Services;

namespace TourPackages.Api.Extensions;

/// <summary>
/// Wires the OTP password-reset infrastructure: an in-process cache for codes
/// (no external dependency) and an email sender chosen from configuration.
/// Net-new, additive.
/// </summary>
public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddOtpInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        // OTP store: framework in-memory cache (codes expire via their TTL). No
        // external service/install required.
        services.AddMemoryCache();
        services.AddScoped<IOtpStore, OtpStore>();
        services.AddScoped<IOtpCodeStore, OtpCodeStore>();

        // Email: real SMTP when a host is configured, otherwise log the message
        // (dev) so the reset code is visible without a mail server.
        var smtpHost = config["Smtp:Host"];
        if (!string.IsNullOrWhiteSpace(smtpHost))
        {
            services.AddScoped<IEmailSender, SmtpEmailSender>();
            services.AddScoped<IOtpEmailService, SmtpOtpEmailService>();
        }
        else
        {
            services.AddScoped<IEmailSender, LoggingEmailSender>();
            services.AddScoped<IOtpEmailService, LogOtpEmailService>();
        }

        // Booking notification emails reuse the IEmailSender wired above. Wired
        // here (rather than in Program.cs / DependencyInjection.cs) so the
        // feature stays self-contained and additive. Runs after
        // AddApplicationServices, so the decorator can wrap the registered
        // BookingService.
        services.AddBookingNotifications();

        return services;
    }
}
