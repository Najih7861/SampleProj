using System.Net;
using System.Net.Mail;

namespace TourPackages.Api.Services;

/// <summary>
/// Sends email over SMTP using settings from the "Smtp" config section
/// (Host, Port, User, Password, From, EnableSsl). Selected when Smtp:Host is set.
/// </summary>
public class SmtpEmailSender : IEmailSender
{
    private readonly IConfiguration _config;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IConfiguration config, ILogger<SmtpEmailSender> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendAsync(string toEmail, string subject, string body)
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

        using var message = new MailMessage(from, toEmail, subject, body);
        await client.SendMailAsync(message);

        _logger.LogInformation("Sent SMTP email to {Email} (subject: {Subject})", toEmail, subject);
    }
}
