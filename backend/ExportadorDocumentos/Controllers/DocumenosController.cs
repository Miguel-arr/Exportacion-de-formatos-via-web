using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentosController : ControllerBase
{
    private readonly ExcelService _excelService;

    public DocumentosController(ExcelService excelService)
    {
        _excelService = excelService;
    }

    /// <summary>
    /// Único endpoint del motor agnóstico.
    /// Recibe el nombre de la plantilla, la hoja y un JSON libre con los datos.
    /// El motor itera sobre las llaves del JSON y reemplaza los placeholders
    /// {{llave}} en la plantilla Excel sin conocer el contenido del documento.
    ///
    /// Ejemplo de body:
    /// {
    ///   "plantilla": "ALTURAS.xlsx",
    ///   "hoja": "Permiso de trabajo",
    ///   "datos": {
    ///     "fecha_expedicion": "25/02/2026",
    ///     "nombre_coordinador": "Juan Pérez",
    ///     "es_apto": "X",
    ///     "FIRMA_RESPONSABLE": { "firma_base64": "data:image/png;base64,..." }
    ///   }
    /// }
    /// </summary>
    [HttpPost("generar")]
    public IActionResult GenerarDocumento([FromBody] GenerarDocumentoRequest req)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(req.Plantilla))
                return BadRequest("El campo 'plantilla' es requerido.");

            if (string.IsNullOrWhiteSpace(req.Hoja))
                return BadRequest("El campo 'hoja' es requerido.");

            if (req.Datos == null || req.Datos.Count == 0)
                return BadRequest("El campo 'datos' no puede estar vacío.");

            var archivo = _excelService.GenerarDesdeJson(req.Plantilla, req.Hoja, req.Datos);
            string nombreArchivo = Path.GetFileNameWithoutExtension(req.Plantilla) + "_Generado.xlsx";

            return File(
                archivo,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                nombreArchivo
            );
        }
        catch (FileNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Error interno: {ex.Message}");
        }
    }
}

/// <summary>
/// Contrato del motor agnóstico.
/// Plantilla y Hoja identifican el archivo Excel.
/// Datos es un JSON libre: cualquier llave coincide con {{llave}} en el Excel.
/// </summary>
public class GenerarDocumentoRequest
{
    public required string Plantilla { get; set; }
    public required string Hoja      { get; set; }
    public required Dictionary<string, JsonElement> Datos { get; set; }
}
