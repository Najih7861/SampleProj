namespace TourPackages.Api.PasswordResetOtp;

/// <summary>
/// Dev fallback used when no SMTP host is configured: logs the email (including
/// the code) so the reset flow is testable without a mail server. Net-new,
/// additive. NOT for production — configure "Smtp" to use <see cref="SmtpOtpEmailService"/>.
/// </summary>
public class LogOtpEmailService : IOtpEmailService
{
    private readonly ILogger<LogOtpEmailService> _logger;

    public LogOtpEmailService(ILogger<LogOtpEmailService> logger) => _logger = logger;

    public Task SendOtpAsync(string toEmail, string username, string otp)
    {
        _logger.LogInformation(
            "[DEV EMAIL] To: {Email} | {Subject}{NewLine}{Body}",
            toEmail, OtpEmailContent.Subject, Environment.NewLine, OtpEmailContent.Body(username, otp));
        return Task.CompletedTask;
    }
}
