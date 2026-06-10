namespace TourPackages.Api.Common.Pagination;

/// <summary>A page of items plus the total count of all matching items.</summary>
public sealed record PagedResult<T>(IReadOnlyList<T> Items, int Total)
{
    /// <summary>Projects the items to another type, preserving the total.</summary>
    public PagedResult<TOut> Map<TOut>(Func<T, TOut> selector) =>
        new(Items.Select(selector).ToList(), Total);
}
