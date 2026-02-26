using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class DocumentosController : ControllerBase
{
    private readonly ExcelService _excelService;

    public DocumentosController(ExcelService excelService)
    {
        _excelService = excelService;
    }

    /// <summary>
    /// Endpoint original de compatibilidad para el formulario de Permiso de Alturas.
    /// </summary>
    [HttpPost("generar-permiso")]
    [Authorize]
    public IActionResult GenerarPermiso([FromBody] PermisoTrabajoRequest req)
    {
        try
        {
            var archivo = _excelService.GenerarExcelConFirma(req);
            return File(
                archivo,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "PermisoGenerado.xlsx"
            );
        }
        catch (Exception ex)
        {
            return NotFound(ex.Message);
        }
    }

    /// <summary>
    /// Endpoint agnostico: recibe el nombre de la plantilla, la hoja y un JSON libre
    /// con los datos a inyectar. El motor itera sobre las llaves del JSON y reemplaza
    /// los placeholders {{llave}} en la plantilla Excel.
    /// </summary>
    [HttpPost("generar")]
    [Authorize]
    public IActionResult GenerarDocumento([FromBody] GenerarDocumentoRequest req)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(req.Plantilla))
                return BadRequest("El campo 'plantilla' es requerido.");

            if (string.IsNullOrWhiteSpace(req.Hoja))
                return BadRequest("El campo 'hoja' es requerido.");

            if (req.Datos == null || req.Datos.Count == 0)
                return BadRequest("El campo 'datos' no puede estar vacio.");

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
/// Request para el endpoint agnostico de generacion de documentos.
/// </summary>
public class GenerarDocumentoRequest
{
    public required string Plantilla { get; set; }
    public required string Hoja { get; set; }
    public required Dictionary<string, JsonElement> Datos { get; set; }
}
