using TourPackages.Api.Dtos;

namespace TourPackages.Api.Services;

/// <summary>
/// Composes and sends booking notification emails (confirmation on creation, and
/// a follow-up when the status changes). Net-new, additive service — reuses the
/// existing <see cref="IEmailSender"/>. Implementations must never throw: a
/// failed email must not break the booking operation that triggered it.
/// </summary>
public interface IBookingEmailService
{
    /// <summary>Emails the customer that their booking has been received (Pending).</summary>
    Task SendBookingReceivedAsync(BookingDto booking);

    /// <summary>Emails the customer that their booking's status changed.</summary>
    Task SendStatusChangedAsync(BookingDto booking);
}
