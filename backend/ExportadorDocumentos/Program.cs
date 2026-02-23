using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// =============================
// Servicios
// =============================

builder.Services.AddControllers();

// 🔹 Swagger (para poder probar la API desde el navegador)
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

app.UseAuthorization();

app.MapControllers();

app.Run();