using System.Net;
using System.Net.Mail;

namespace TourPackages.Api.PasswordResetOtp;

/// <summary>
/// Sends the OTP email over SMTP using the "Smtp" config section
/// (Host, Port, User, Password, From, EnableSsl). Selected when Smtp:Host is set.
/// Net-new, additive.
/// </summary>
public class SmtpOtpEmailService : IOtpEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<SmtpOtpEmailService> _logger;

    public SmtpOtpEmailService(IConfiguration config, ILogger<SmtpOtpEmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendOtpAsync(string toEmail, string username, string otp)
    {
        var smtp = _config.GetSection("Smtp");
        var host = smtp["Host"]!;
        var port = int.TryParse(smtp["Port"], out var p) ? p : 587;
        var from = string.IsNullOrWhiteSpace(smtp["From"]) ? "no-reply@wanderlust.local" : smtp["From"]!;

        using var client = new SmtpClient(host, port)
        {
            EnableSsl = !bool.TryParse(smtp["EnableSsl"], out var ssl) || ssl
        };

        var user = smtp["User"];
        if (!string.IsNullOrWhiteSpace(user))
            client.Credentials = new NetworkCredential(user, smtp["Password"]);

        using var message = new MailMessage(from, toEmail, OtpEmailContent.Subject, OtpEmailContent.Body(username, otp));
        await client.SendMailAsync(message);

        _logger.LogInformation("Sent password-reset OTP email to {Email}", toEmail);
    }
}
