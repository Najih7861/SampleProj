namespace TourPackages.Api.Common.Pagination;

/// <summary>
/// Optional paging arguments parsed from <c>?page</c>/<c>?pageSize</c>. Net-new,
/// additive. Pagination is opt-in: when a client supplies neither value, list
/// endpoints return the full collection (unchanged behaviour), so existing
/// callers keep working. When supplied, values are clamped to sane bounds.
/// </summary>
public sealed record PageRequest(int Page, int PageSize)
{
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 100;

    /// <summary>Response header carrying the total count of matching items.</summary>
    public const string TotalCountHeader = "X-Total-Count";

    public int Skip => (Page - 1) * PageSize;

    /// <summary>
    /// Builds a clamped <see cref="PageRequest"/>, or null when neither page nor
    /// pageSize was supplied (signalling "return everything").
    /// </summary>
    public static PageRequest? FromQuery(int? page, int? pageSize)
    {
        if (page is null && pageSize is null) return null;

        var resolvedPage = page is > 0 ? page.Value : 1;
        var resolvedSize = Math.Clamp(pageSize ?? DefaultPageSize, 1, MaxPageSize);
        return new PageRequest(resolvedPage, resolvedSize);
    }
}
