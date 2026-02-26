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
// Necesario cuando el frontend se abre como file:// o desde cualquier origen
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(_ => true)  // Acepta cualquier origen, incluyendo file://
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();             // Necesario para cookies y Authorization header
    });
});

// JWT - Autenticacion y Autorizacion
var jwtSecretKey = builder.Configuration["Jwt:SecretKey"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecretKey)),
            ValidateIssuer = false,
            ValidateAudience = false,
            ClockSkew = TimeSpan.Zero
        };

        // Leer el token desde la cookie HttpOnly O desde el header Authorization
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                // Primero intentar desde cookie
                if (context.Request.Cookies.TryGetValue("jwt_token", out var cookieToken))
                {
                    context.Token = cookieToken;
                    return Task.CompletedTask;
                }
                // Si no hay cookie, leer desde header Authorization: Bearer <token>
                var authHeader = context.Request.Headers["Authorization"].FirstOrDefault();
                if (authHeader != null && authHeader.StartsWith("Bearer "))
                {
                    context.Token = authHeader.Substring("Bearer ".Length).Trim();
                }
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// Swagger con soporte para JWT
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Exportador Documentos API",
        Version = "v1",
        Description = "API para generar documentos Excel con motor agnostico de plantillas"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingresa el token JWT"
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

// Habilitar CORS (debe ir antes de Authentication/Authorization)
app.UseCors();

// Autenticacion y Autorizacion
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
