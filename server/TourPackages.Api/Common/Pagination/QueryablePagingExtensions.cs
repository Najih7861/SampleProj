using Microsoft.EntityFrameworkCore;

namespace TourPackages.Api.Common.Pagination;

/// <summary>
/// Applies a <see cref="PageRequest"/> to an EF Core query, returning the page
/// of items together with the total matching count (two queries: count + page).
/// </summary>
public static class QueryablePagingExtensions
{
    public static async Task<PagedResult<T>> ToPagedResultAsync<T>(this IQueryable<T> query, PageRequest page)
    {
        var total = await query.CountAsync();
        var items = await query.Skip(page.Skip).Take(page.PageSize).ToListAsync();
        return new PagedResult<T>(items, total);
    }
}
