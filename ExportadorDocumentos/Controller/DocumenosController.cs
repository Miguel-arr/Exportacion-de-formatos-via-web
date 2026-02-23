using ClosedXML.Excel;
using Microsoft.AspNetCore.Mvc;

namespace ExportadorDocumentos.Controllers
{
    // Clase que representa el JSON que enviará el Frontend
    public class PermisoTrabajoRequest
    {
        public string Fecha { get; set; }
        public string HoraInicio { get; set; }
        public string Area { get; set; }
        public string AlturaMaxima { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class DocumentosController : ControllerBase
    {
        [HttpPost("generar-permiso")]
        public IActionResult GenerarPermiso([FromBody] PermisoTrabajoRequest request)
        {
            try
            {
                // 1. Ruta de la plantilla original
                string templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "F-SG-02 PERMISO DE TRABAJO  EN ALTURAS GDINGENIERIA SAS.xlsx");

                if (!System.IO.File.Exists(templatePath))
                    return NotFound("No se encontró la plantilla de Excel.");

                // 2. Cargar el Excel en memoria con ClosedXML
                using var workbook = new XLWorkbook(templatePath);
                
                // Buscar la pestaña específica por nombre o índice (1 es la primera)
                var worksheet = workbook.Worksheet(1); 

                // 3. Reemplazar las etiquetas con los datos del JSON
                ReemplazarTexto(worksheet, "{{FECHA_PERMISO}}", request.Fecha);
                ReemplazarTexto(worksheet, "{{HORA_INICIO}}", request.HoraInicio);
                ReemplazarTexto(worksheet, "{{AREA_TRABAJO}}", request.Area);
                ReemplazarTexto(worksheet, "{{ALTURA_MAXIMA}}", request.AlturaMaxima);

                // 4. Guardar el archivo modificado en un Stream (memoria)
                using var stream = new MemoryStream();
                workbook.SaveAs(stream);
                var content = stream.ToArray();

                // 5. Devolver el archivo al Frontend
                return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Permiso_Generado.xlsx");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        // Método auxiliar para buscar y reemplazar en todo el documento
        private void ReemplazarTexto(IXLWorksheet ws, string etiqueta, string valor)
        {
            // Busca todas las celdas que contengan la etiqueta
            var celdas = ws.Search(etiqueta);
            foreach (var celda in celdas)
            {
                // Reemplaza la etiqueta exacta por el valor, manteniendo el resto del texto
                celda.Value = celda.Value.ToString().Replace(etiqueta, valor ?? "");
            }
        }
    }
}