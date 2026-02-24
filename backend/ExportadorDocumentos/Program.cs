using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// =============================
// Servicios
// =============================

builder.Services.AddControllers();

// 🔥 REGISTRAR EL SERVICIO
builder.Services.AddScoped<ExcelService>();

// 🌐 CORS - Permite peticiones desde el frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 🔹 Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Exportador Documentos API",
        Version = "v1",
        Description = "API para generar permisos de trabajo en Excel"
    });
});

var app = builder.Build();

// =============================
// Middleware
// =============================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();

// 🌐 Habilitar CORS
app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();