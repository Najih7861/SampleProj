using TourPackages.Api.Models;

namespace TourPackages.Api.Repositories;

/// <summary>
/// Data access for users. Net-new, additive abstraction over AppDbContext.
/// </summary>
public interface IUserRepository
{
    Task<bool> UsernameExistsAsync(string username);

    Task<bool> EmailExistsAsync(string email);

    Task<User?> GetByUsernameAsync(string username);

    Task<User?> GetByEmailAsync(string email);

    void Add(User user);

    Task<int> SaveChangesAsync();
}
