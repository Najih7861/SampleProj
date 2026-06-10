namespace TourPackages.Api.PasswordResetOtp;

/// <summary>
/// Registers the forgot-password OTP feature: an in-memory code store and an
/// email sender (real SMTP when "Smtp:Host" is configured, otherwise a dev
/// logger). Net-new, additive — wired with a single call in Program.cs.
/// </summary>
public static class PasswordResetOtpModule
{
    public static IServiceCollection AddPasswordResetOtp(this IServiceCollection services, IConfiguration config)
    {
        services.AddMemoryCache();
        services.AddScoped<IOtpCodeStore, OtpCodeStore>();

        if (!string.IsNullOrWhiteSpace(config["Smtp:Host"]))
            services.AddScoped<IOtpEmailService, SmtpOtpEmailService>();
        else
            services.AddScoped<IOtpEmailService, LogOtpEmailService>();

        return services;
    }
}
