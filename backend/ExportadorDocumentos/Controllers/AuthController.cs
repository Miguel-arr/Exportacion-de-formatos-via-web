using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly JwtService _jwtService;

    // Usuarios en memoria (en producción se reemplazaría con base de datos)
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
    /// Autentica al usuario y devuelve un JWT almacenado en cookie HttpOnly.
    /// </summary>
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest req)
    {
        var user = _users.FirstOrDefault(u =>
            u.Username == req.Username && u.Password == req.Password);

        if (user == default)
            return Unauthorized(new { message = "Usuario o contraseña incorrectos." });

        var token = _jwtService.GenerarToken(user.Username, user.DisplayName);

        // Almacenar el token en una cookie HttpOnly y Secure
        Response.Cookies.Append("jwt_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure   = false, // Cambiar a true en producción con HTTPS
            SameSite = SameSiteMode.Strict,
            Expires  = DateTimeOffset.UtcNow.AddHours(8)
        });

        return Ok(new
        {
            message     = "Autenticación exitosa.",
            username    = user.Username,
            displayName = user.DisplayName
        });
    }

    /// <summary>
    /// Cierra la sesión eliminando la cookie JWT.
    /// </summary>
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete("jwt_token");
        return Ok(new { message = "Sesión cerrada correctamente." });
    }

    /// <summary>
    /// Verifica si el token JWT en la cookie es válido.
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
