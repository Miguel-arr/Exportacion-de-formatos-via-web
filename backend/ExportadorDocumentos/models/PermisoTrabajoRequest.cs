public class PermisoTrabajoRequest
{
    public required string Fecha { get; set; }
    public required string HoraInicio { get; set; }
    public required string Area { get; set; }
    public required string AlturaMaxima { get; set; }

    // Firmas
    public string? ImgFirmaResponsableTarea { get; set; }
}