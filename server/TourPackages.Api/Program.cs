using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using TourPackages.Api.Data;

var builder = WebApplication.CreateBuilder(args);

const string ClientCors = "ClientCors";

// Database (PostgreSQL via EF Core)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Controllers + serialize enums as strings (e.g. "Pending")
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

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

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(ClientCors);
app.UseAuthorization();
app.MapControllers();

app.Run();
