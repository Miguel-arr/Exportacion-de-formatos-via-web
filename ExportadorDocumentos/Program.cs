var builder = WebApplication.CreateBuilder(args);

// Habilitar Controladores
builder.Services.AddControllers();

// Configurar CORS para permitir peticiones desde cualquier Frontend local
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirTodo", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors("PermitirTodo");
app.MapControllers();

app.Run();