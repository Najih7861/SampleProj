using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using Serilog.Events;
using TourPackages.Api.Auth;
using TourPackages.Api.Common.Errors;
using TourPackages.Api.Common.Pagination;
using TourPackages.Api.Data;
using TourPackages.Api.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Structured logging (console + daily rolling file). Overridable via a "Serilog"
// config section; sensible code defaults otherwise.
builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .WriteTo.Console()
    .WriteTo.File("logs/api-.log", rollingInterval: RollingInterval.Day, retainedFileCountLimit: 14));

// Refuse to start in Production with default/missing secrets (no-op in Development).
builder.ValidateSecrets();

const string ClientCors = "ClientCors";

// Database (PostgreSQL via EF Core)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Repository + service layers (data access and domain logic).
builder.Services.AddApplicationServices();

// Reviews & ratings feature (self-contained registration; see ReviewServiceCollectionExtensions).
builder.Services.AddReviewServices();

// JWT bearer authentication + role-based authorization.
builder.Services.AddScoped<JwtTokenService>();
var jwt = builder.Configuration.GetSection("Jwt");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwt["Issuer"],
            ValidAudience = jwt["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!)),
        };
    });
builder.Services.AddAuthorization();

// Global error handling → consistent RFC 7807 ProblemDetails for every error.
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Controllers + serialize enums as strings (e.g. "Pending")
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// FluentValidation request validation (richer business rules → 400 ProblemDetails).
builder.Services.AddRequestValidation();

// Health checks (includes a DB connectivity probe) exposed at /health.
builder.Services.AddHealthChecks().AddDbContextCheck<AppDbContext>();

// Rate limiting (brute-force guard on the auth endpoints).
builder.Services.AddAuthRateLimiting();

// OTP password-reset infrastructure (in-memory OTP store + SMTP/logging email).
builder.Services.AddOtpInfrastructure(builder.Configuration);

// Swagger / OpenAPI UI for manual testing
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Allow the configured client origins to call the API. Defaults to the Vite dev
// server; override per-environment via "Cors:AllowedOrigins" (or env vars).
builder.Services.AddCors(options =>
{
    var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                         ?? new[] { "http://localhost:5173" };
    options.AddPolicy(ClientCors, policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              // Let the browser read the pagination total on direct (non-proxied) calls.
              .WithExposedHeaders(PageRequest.TotalCountHeader));
});

var app = builder.Build();

// Seed the default admin user (idempotent).
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await TourPackages.Api.Data.DbInitializer.SeedAdminAsync(db);
}

// Outermost middleware: turn any unhandled exception into a ProblemDetails response.
app.UseExceptionHandler();

// Concise structured log line per HTTP request.
app.UseSerilogRequestLogging();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
// Serve uploaded images from wwwroot (e.g. /uploads/{guid}.jpg).
app.UseStaticFiles();
app.UseCors(ClientCors);
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();

// Liveness/readiness probe (anonymous). Includes the EF Core DB connectivity check.
app.MapHealthChecks("/health");

app.Run();
