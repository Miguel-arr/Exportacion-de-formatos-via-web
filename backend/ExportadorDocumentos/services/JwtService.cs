using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

public class JwtService
{
    private readonly IConfiguration _config;

    public JwtService(IConfiguration config)
    {
        _config = config;
    }

    public string GenerarToken(string username, string displayName)
    {
        var secretKey = _config["Jwt:SecretKey"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)); // Convertir la clave secreta a bytes
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);// Crear las claims del token (informacion que se incluye en el token) como una firma

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username), // Claim para el nombre de usuario admin
            new Claim("displayName", displayName), // nombre a mostrar administrador
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // id unico del token para evitar reutilizacion
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1),// El token expira en 1 hora
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
