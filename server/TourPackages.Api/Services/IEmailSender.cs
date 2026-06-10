namespace TourPackages.Api.Services;

/// <summary>
/// Sends transactional emails (e.g. password-reset codes). Net-new, additive.
/// Implemented by <see cref="SmtpEmailSender"/> (real SMTP) or
/// <see cref="LoggingEmailSender"/> (dev fallback that logs the message).
/// </summary>
public interface IEmailSender
{
    Task SendAsync(string toEmail, string subject, string body);
}
