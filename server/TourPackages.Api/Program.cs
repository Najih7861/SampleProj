using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TourPackages.Api.Auth;
using TourPackages.Api.Data;
using TourPackages.Api.PasswordResetOtp;

var builder = WebApplication.CreateBuilder(args);

const string ClientCors = "ClientCors";

// Database (PostgreSQL via EF Core)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

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

// Controllers + serialize enums as strings (e.g. "Pending")
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

// Forgot-password via email OTP (in-memory code store + SMTP/log email sender).
builder.Services.AddPasswordResetOtp(builder.Configuration);

// Swagger / OpenAPI UI for manual testing
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Allow the Vite dev server to call the API
builder.Services.AddCors(options =>
{
    options.AddPolicy(ClientCors, policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Seed the default admin user (idempotent).
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await TourPackages.Api.Data.DbInitializer.SeedAdminAsync(db);
}

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
app.MapControllers();

app.Run();
