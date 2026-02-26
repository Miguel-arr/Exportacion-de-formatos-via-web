using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly JwtService _jwtService;

    // Usuarios en memoria (en produccion se reemplazaria con base de datos)
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
    /// Autentica al usuario. Devuelve el JWT en el body Y en una cookie HttpOnly.
    /// El frontend puede usar cualquiera de los dos metodos segun su contexto.
    /// </summary>
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest req)
    {
        var user = _users.FirstOrDefault(u =>
            u.Username == req.Username && u.Password == req.Password);

        if (user == default)
            return Unauthorized(new { message = "Usuario o contrasena incorrectos." });

        var token = _jwtService.GenerarToken(user.Username, user.DisplayName);

        // Guardar en cookie HttpOnly (funciona cuando el frontend esta en un servidor HTTP)
        Response.Cookies.Append("jwt_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure   = false, // true en produccion con HTTPS
            SameSite = SameSiteMode.None, // None para permitir cross-origin
            Expires  = DateTimeOffset.UtcNow.AddHours(8)
        });

        // Devolver el token tambien en el body para que el frontend
        // pueda guardarlo en localStorage cuando se abre como file://
        return Ok(new
        {
            message     = "Autenticacion exitosa.",
            token       = token,
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
    /// Verifica si el token JWT es valido (via cookie o Authorization header).
    /// </summary>
    [HttpGet("me")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public IActionResult Me()
    {
        var username    = User.Identity?.Name ?? "";
        var displayName = User.FindFirst("displayName")?.Value ?? "";
        return Ok(new { username, displayName });
    }
}
