using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// =============================
// Servicios
// =============================
builder.Services.AddControllers();

// Registrar servicios de negocio
builder.Services.AddScoped<ExcelService>();
builder.Services.AddScoped<JwtService>();

// CORS - Configuracion permisiva para desarrollo local
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(_ => true)  // Acepta cualquier origen en desarrollo
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// JWT - Autenticacion y Autorizacion
// El token se lee desde el header Authorization: Bearer <token>
// El frontend lo obtiene del login y lo almacena en localStorage
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]!)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };

        // El middleware JWT automaticamente lee desde Authorization header
        // No es necesario configurar OnMessageReceived para desarrollo
    });

builder.Services.AddAuthorization();

// Swagger con soporte para JWT
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Exportador Documentos API - GD Ingenieria S.A.S",
        Version = "v1",
        Description = "Motor de automatizacion agnostico para generacion de documentos Excel. " +
                      "El motor itera sobre las llaves del JSON e inyecta los valores en los " +
                      "placeholders {{llave}} de la plantilla Excel sin conocer el contenido del documento."
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingresa el token JWT en el formato: Bearer <token>"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
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

// CORS debe ir antes de Authentication/Authorization
app.UseCors();

// Autenticacion y Autorizacion
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
