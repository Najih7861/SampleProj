namespace TourPackages.Api.Common.Results;

/// <summary>
/// Outcome of a service operation. Lets the domain/service layer report an
/// expected result (success or a specific failure) without throwing, so
/// controllers stay thin and HTTP behaviour is preserved exactly. Net-new,
/// additive type — nothing existing depends on it.
/// </summary>
public enum ResultStatus
{
    Success,
    NotFound,
    Invalid,
    Conflict,
    Unauthorized
}

/// <summary>Common surface shared by <see cref="Result"/> and <see cref="Result{T}"/>.</summary>
public interface IServiceResult
{
    ResultStatus Status { get; }
    string? Error { get; }
}

/// <summary>A service outcome with no return value (void operations).</summary>
public class Result : IServiceResult
{
    public ResultStatus Status { get; }
    public string? Error { get; }
    public bool IsSuccess => Status == ResultStatus.Success;

    protected Result(ResultStatus status, string? error)
    {
        Status = status;
        Error = error;
    }

    public static Result Success() => new(ResultStatus.Success, null);
    public static Result NotFound(string? error = null) => new(ResultStatus.NotFound, error);
    public static Result Invalid(string error) => new(ResultStatus.Invalid, error);
    public static Result Conflict(string error) => new(ResultStatus.Conflict, error);
    public static Result Unauthorized(string? error = null) => new(ResultStatus.Unauthorized, error);
}

/// <summary>A service outcome carrying a value on success.</summary>
public sealed class Result<T> : IServiceResult
{
    public ResultStatus Status { get; }
    public string? Error { get; }
    public T? Value { get; }
    public bool IsSuccess => Status == ResultStatus.Success;

    private Result(ResultStatus status, T? value, string? error)
    {
        Status = status;
        Value = value;
        Error = error;
    }

    public static Result<T> Success(T value) => new(ResultStatus.Success, value, null);
    public static Result<T> NotFound(string? error = null) => new(ResultStatus.NotFound, default, error);
    public static Result<T> Invalid(string error) => new(ResultStatus.Invalid, default, error);
    public static Result<T> Conflict(string error) => new(ResultStatus.Conflict, default, error);
    public static Result<T> Unauthorized(string? error = null) => new(ResultStatus.Unauthorized, default, error);
}
