using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class DocumentosController : ControllerBase
{
    private readonly ExcelService _excelService;

    // 🔥 Inyección correcta
    public DocumentosController(ExcelService excelService)
    {
        _excelService = excelService;
    }

    [HttpPost("generar-permiso")]
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
}