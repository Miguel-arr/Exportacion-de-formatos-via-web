using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ExportadorDocumentos.Data;
using Microsoft.EntityFrameworkCore;
using ExportadorDocumentos.Models;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly JwtService _jwtService;
    private readonly ApplicationDbContext _context;

    public AuthController(JwtService jwtService, ApplicationDbContext context)
    {
        _jwtService = jwtService;
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || string.IsNullOrWhiteSpace(req.Password))
        {
            return BadRequest(new { message = "Usuario y contraseña son requeridos." });
        }

        // Buscamos al usuario comparando el username sin importar mayúsculas/minúsculas
        // y comparando el password exactamente como está en tu BD (texto plano: 1234 o 123)
        var user = await _context.Clientes.FirstOrDefaultAsync(c =>
            c.Username != null && c.Username.ToLower() == req.Username.ToLower() && c.Password == req.Password);

        if (user == null)
        {
            return Unauthorized(new { message = "Credenciales incorrectas. Verifica el usuario y la contraseña." });
        }

        var token = _jwtService.GenerarToken(user.Id, user.Username!, user.Displayname ?? user.Nombre!);

        return Ok(new
        {
            message     = "Autenticación exitosa.",
            userId      = user.Id,
            username    = user.Username!,
            displayname = user.Displayname ?? user.Nombre!,
            token       = token
        });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> Me()
    {
        var username    = User.Identity?.Name ?? "";
        var displayName = User.FindFirst("displayName")?.Value ?? "";
        var userIdClaim = User.FindFirst("userId")?.Value;

        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Token inválido." });
        }

        return Ok(new { userId, username, displayName });
    }
}
