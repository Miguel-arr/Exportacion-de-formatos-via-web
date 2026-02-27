using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly JwtService _jwtService;

    // Usuarios hardcodeados para desarrollo (en produccion usar base de datos)
    private static readonly List<(string Username, string Password, string DisplayName)> _users = new()
    {
        ("admin",    "1234",   "Administrador"),
        ("operador", "op2024", "Operador")
    };

    public AuthController(JwtService jwtService)
    {
        _jwtService = jwtService;
    }

    /// <summary>
    /// Autentica al usuario y genera un JWT firmado.
    /// El token se almacena en una Cookie con atributos HttpOnly y Secure
    /// segun los lineamientos tecnicos del proyecto (PDF).
    ///
    /// Flujo de autenticacion:
    /// 1. El usuario ingresa credenciales en el Frontend.
    /// 2. El Backend valida y genera un JWT firmado.
    /// 3. El Frontend almacena el token en una Cookie con atributos HttpOnly y Secure.
    /// 4. Cada peticion posterior incluye el token de forma automatica para validacion.
    /// </summary>
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest req)
    {
        var user = _users.FirstOrDefault(u =>
            u.Username == req.Username && u.Password == req.Password);

        if (user == default)
            return Unauthorized(new { message = "Usuario o contrasena incorrectos." });

        var token = _jwtService.GenerarToken(user.Username, user.DisplayName);

        // Guardar en Cookie con atributos HttpOnly y Secure
        // segun lineamientos tecnicos del PDF
        Response.Cookies.Append("jwt_token", token, new CookieOptions
        {
            HttpOnly = true,                    // No accesible desde JavaScript (seguridad XSS)
            Secure   = false,                   // true en produccion con HTTPS
            SameSite = SameSiteMode.None,       // None para permitir cross-origin (frontend en otro puerto)
            Expires  = DateTimeOffset.UtcNow.AddHours(8)
        });

        // Devolver informacion del usuario (NO el token, ya esta en la cookie)
        return Ok(new
        {
            message     = "Autenticacion exitosa.",
            username    = user.Username,
            displayName = user.DisplayName
        });
    }

    /// <summary>
    /// Cierra la sesion eliminando la cookie JWT.
    /// </summary>
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("jwt_token");
        return Ok(new { message = "Sesion cerrada correctamente." });
    }

    /// <summary>
    /// Verifica si el token JWT es valido (via cookie HttpOnly).
    /// Util para que el frontend verifique si la sesion sigue activa al recargar.
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var username    = User.Identity?.Name ?? "";
        var displayName = User.FindFirst("displayName")?.Value ?? "";
        return Ok(new { username, displayName });
    }

    /// <summary>
    /// Obtiene el token JWT para fallback en desarrollo.
    /// En desarrollo, cuando el proxy de Vite no puede pasar cookies correctamente
    /// (puertos diferentes), el frontend necesita el token en el header Authorization.
    /// Este endpoint lo proporciona.
    /// En produccion, esta ruta no es necesaria porque la cookie funciona correctamente.
    /// </summary>
    [HttpGet("token")]
    [Authorize]
    public IActionResult ObtenerToken()
    {
        var username    = User.Identity?.Name ?? "";
        var displayName = User.FindFirst("displayName")?.Value ?? "";

        // Generar un nuevo token (el frontend lo usara en el header Authorization)
        var token = _jwtService.GenerarToken(username, displayName);

        return Ok(new { token });
    }
}
