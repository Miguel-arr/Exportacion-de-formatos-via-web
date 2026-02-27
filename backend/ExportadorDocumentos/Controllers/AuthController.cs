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
    ///
    /// Flujo de autenticacion:
    /// 1. El usuario ingresa credenciales en el Frontend.
    /// 2. El Backend valida y genera un JWT firmado.
    /// 3. El Frontend almacena el token en localStorage (desarrollo) o cookie HttpOnly (produccion).
    /// 4. Cada peticion posterior incluye el token en el header Authorization: Bearer <token>.
    /// </summary>
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest req)
    {
        var user = _users.FirstOrDefault(u =>
            u.Username == req.Username && u.Password == req.Password);

        if (user == default)
            return Unauthorized(new { message = "Usuario o contrasena incorrectos." });

        var token = _jwtService.GenerarToken(user.Username, user.DisplayName);

        // En desarrollo: devolver el token en el body para que el frontend lo almacene en localStorage
        // En produccion: setear en cookie HttpOnly y no devolver en el body
        return Ok(new
        {
            message     = "Autenticacion exitosa.",
            username    = user.Username,
            displayName = user.DisplayName,
            token       = token  // El frontend lo almacena en localStorage
        });
    }

    /// <summary>
    /// Cierra la sesion eliminando el token del cliente.
    /// El backend simplemente confirma el logout.
    /// </summary>
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new { message = "Sesion cerrada correctamente." });
    }

    /// <summary>
    /// Verifica si el token JWT es valido.
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
}
