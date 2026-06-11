using TourPackages.Api.Dtos;

namespace TourPackages.Api.Services;

/// <inheritdoc />
public class BookingEmailService : IBookingEmailService
{
    private readonly IEmailSender _email;
    private readonly ILogger<BookingEmailService> _logger;

    public BookingEmailService(IEmailSender email, ILogger<BookingEmailService> logger)
    {
        _email = email;
        _logger = logger;
    }

    public Task SendBookingReceivedAsync(BookingDto b)
    {
        var subject = $"Booking received — {b.PackageTitle}";
        var body =
            $"Hi {b.CustomerName},\n\n" +
            $"Thanks for booking with Wanderlust Tours! We've received your booking for " +
            $"{b.PackageTitle} ({b.PackageDestination}).\n\n" +
            $"Travel date: {b.TravelDate:yyyy-MM-dd}\n" +
            $"Travelers: {b.NumberOfTravelers}\n" +
            $"Current status: {b.Status}\n\n" +
            $"We'll email you again as soon as the status changes. Safe travels!";
        return TrySendAsync(b.Email, subject, body);
    }

    public Task SendStatusChangedAsync(BookingDto b)
    {
        var subject = $"Booking {b.Status} — {b.PackageTitle}";
        var body =
            $"Hi {b.CustomerName},\n\n" +
            $"The status of your booking for {b.PackageTitle} ({b.PackageDestination}) is now: " +
            $"{b.Status}.\n\n" +
            $"Travel date: {b.TravelDate:yyyy-MM-dd}\n" +
            $"Travelers: {b.NumberOfTravelers}\n\n" +
            $"Thank you for choosing Wanderlust Tours!";
        return TrySendAsync(b.Email, subject, body);
    }

    // Sends and swallows failures (logged) so email problems never fail the
    // booking operation that triggered the notification.
    private async Task TrySendAsync(string toEmail, string subject, string body)
    {
        if (string.IsNullOrWhiteSpace(toEmail)) return;
        try
        {
            await _email.SendAsync(toEmail, subject, body);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send booking email to {Email} (subject: {Subject})", toEmail, subject);
        }
    }
}
