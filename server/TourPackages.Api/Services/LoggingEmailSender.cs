namespace TourPackages.Api.Services;

/// <summary>
/// Dev fallback used when no SMTP host is configured: logs the email (including
/// the OTP) instead of sending it, so the reset flow is testable without a mail
/// server. NOT for production — the production path uses <see cref="SmtpEmailSender"/>.
/// </summary>
public class LoggingEmailSender : IEmailSender
{
    private readonly ILogger<LoggingEmailSender> _logger;

    public LoggingEmailSender(ILogger<LoggingEmailSender> logger) => _logger = logger;

    public Task SendAsync(string toEmail, string subject, string body)
    {
        _logger.LogInformation("[DEV EMAIL] To: {Email} | Subject: {Subject}{NewLine}{Body}",
            toEmail, subject, Environment.NewLine, body);
        return Task.CompletedTask;
    }
}
