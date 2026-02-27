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
// Necesario cuando el frontend React se sirve desde un origen diferente
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(_ => true)  // Acepta cualquier origen en desarrollo
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();             // Necesario para cookies HttpOnly
    });
});

// JWT - Autenticacion y Autorizacion
// Configuracion exacta segun lineamientos tecnicos del proyecto (PDF)
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

        // Leer el token desde la cookie HttpOnly (flujo principal segun lineamientos PDF)
        // El frontend almacena el token en Cookie con atributos HttpOnly y Secure
        // Cada peticion posterior incluye el token de forma automatica para validacion
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                if (context.Request.Cookies.TryGetValue("jwt_token", out var cookieToken))
                {
                    context.Token = cookieToken;
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
        Description = "Ingresa el token JWT (solo para pruebas en Swagger; en produccion se usa cookie HttpOnly)"
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
