using TourPackages.Api.Dtos;

namespace TourPackages.Api.Services;

public interface IAdminStatsService
{
    Task<AdminStatsDto> GetStatsAsync();
}
