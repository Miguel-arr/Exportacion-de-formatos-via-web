using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class DocumentosController : ControllerBase
{
    private readonly ExcelService _excelService;

    public DocumentosController() => _excelService = new ExcelService();

    [HttpPost("generar-permiso")]
    public IActionResult GenerarPermiso([FromBody] PermisoTrabajoRequest req)
    {
        try
        {
            var bytes = _excelService.GenerarExcelConFirma(req);
            return File(bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"Permiso_{req.Fecha}.xlsx");
        }
        catch (FileNotFoundException)
        {
            return NotFound("Plantilla no encontrada en Templates/");
        }
        catch (Exception ex)
        {
            return BadRequest($"Error al generar el archivo: {ex.Message}");
        }
    }
}