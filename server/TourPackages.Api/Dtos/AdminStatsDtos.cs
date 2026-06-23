namespace TourPackages.Api.Dtos;

/// <summary>
/// Aggregated counts for the admin dashboard. All values are plain numbers
/// (no enums on the wire); <see cref="AverageRating"/> is rounded to one
/// decimal and is 0 when there are no reviews.
/// </summary>
public record AdminStatsDto(
    int TotalPackages,
    int TotalPlaces,
    int TotalBookings,
    int PendingBookings,
    int ConfirmedBookings,
    int CancelledBookings,
    int TotalReviews,
    double AverageRating);
