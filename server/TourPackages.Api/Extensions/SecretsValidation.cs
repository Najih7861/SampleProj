namespace TourPackages.Api.Extensions;

/// <summary>
/// Fail-fast guard for production secrets. The committed appsettings.json holds
/// dev-only values (per CLAUDE.md); this refuses to start in Production unless
/// the JWT signing key and connection string are supplied out-of-band (env vars
/// like Jwt__Key / ConnectionStrings__DefaultConnection, user-secrets, or a
/// secret store). Development is unaffected — clone-and-run still works.
///
/// Net-new, additive. Does not change dev behaviour.
/// </summary>
public static class SecretsValidation
{
    private const string DevJwtKey = "dev-only-super-secret-signing-key-change-me-1234567890";

    public static void ValidateSecrets(this WebApplicationBuilder builder)
    {
        if (!builder.Environment.IsProduction()) return;

        var jwtKey = builder.Configuration["Jwt:Key"];
        if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey == DevJwtKey)
            throw new InvalidOperationException(
                "Jwt:Key must be set to a strong, non-default value in Production " +
                "(supply it via an environment variable Jwt__Key or a secret store).");

        if (string.IsNullOrWhiteSpace(builder.Configuration.GetConnectionString("DefaultConnection")))
            throw new InvalidOperationException(
                "ConnectionStrings:DefaultConnection must be configured in Production " +
                "(supply it via ConnectionStrings__DefaultConnection or a secret store).");
    }
}
