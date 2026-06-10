using TourPackages.Api.Services;

namespace TourPackages.Api.Extensions;

/// <summary>
/// Wires the OTP password-reset infrastructure: a distributed cache for codes
/// and an email sender, each chosen from configuration. Net-new, additive.
/// </summary>
public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddOtpInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        // OTP store: Redis when a connection string is configured (codes live in
        // Redis with their TTL); in-memory distributed cache otherwise (dev).
        var redisConnection = config["Redis:ConnectionString"];
        if (!string.IsNullOrWhiteSpace(redisConnection))
            services.AddStackExchangeRedisCache(options => options.Configuration = redisConnection);
        else
            services.AddDistributedMemoryCache();

        services.AddScoped<IOtpStore, OtpStore>();

        // Email: real SMTP when a host is configured, otherwise log the message
        // (dev) so the reset code is visible without a mail server.
        var smtpHost = config["Smtp:Host"];
        if (!string.IsNullOrWhiteSpace(smtpHost))
            services.AddScoped<IEmailSender, SmtpEmailSender>();
        else
            services.AddScoped<IEmailSender, LoggingEmailSender>();

        return services;
    }
}
