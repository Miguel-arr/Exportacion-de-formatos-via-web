using ClosedXML.Excel;
using System.Text.Json;
using System.Text.RegularExpressions;

/// <summary>
/// Motor de generación agnóstico de documentos Excel.
/// Itera sobre las llaves del JSON e inyecta los valores en los placeholders
/// que tengan el mismo nombre (formato {{llave}}) en la plantilla.
/// </summary>
public class ExcelService
{
    private readonly IWebHostEnvironment _env;

    public ExcelService(IWebHostEnvironment env)
    {
        _env = env;
    }

    /// <summary>
    /// Genera un archivo Excel a partir de una plantilla y un JSON agnóstico.
    /// </summary>
    public byte[] GenerarDesdeJson(
        string templateName,
        string sheetName,
        Dictionary<string, JsonElement> datos)
    {
        string templatePath = Path.Combine(_env.ContentRootPath, "Templates", templateName);

        if (!File.Exists(templatePath))
            throw new FileNotFoundException($"Plantilla '{templateName}' no encontrada en Templates/");

        using var workbook = new XLWorkbook(templatePath);
        var ws = workbook.Worksheet(sheetName);

        foreach (var kvp in datos)
        {
            string placeholder = $"{{{{{kvp.Key}}}}}";

            if (kvp.Value.ValueKind == JsonValueKind.Array)
            {
                ProcesarListaDinamica(ws, placeholder, kvp.Value);
            }
            else if (kvp.Value.ValueKind == JsonValueKind.Object)
            {
                if (kvp.Value.TryGetProperty("firma_base64", out var base64El))
                {
                    string base64 = base64El.GetString() ?? "";
                    InyectarFirmaBase64(ws, placeholder, base64);
                }
            }
            else
            {
                string valor = kvp.Value.ValueKind == JsonValueKind.Null
                    ? ""
                    : kvp.Value.ToString();

                ReemplazarPlaceholder(ws, placeholder, valor);
            }
        }

        LimpiarPlaceholders(ws);

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }

    private static void ReemplazarPlaceholder(IXLWorksheet ws, string placeholder, string valor)
    {
        foreach (var cell in ws.CellsUsed())
        {
            var texto = cell.GetString();
            if (texto.Contains(placeholder))
                cell.Value = texto.Replace(placeholder, valor);
        }
    }

    private static void ProcesarListaDinamica(IXLWorksheet ws, string placeholder, JsonElement array)
    {
        IXLCell? semillaCell = null;
        foreach (var cell in ws.CellsUsed())
        {
            if (cell.GetString().Contains(placeholder))
            {
                semillaCell = cell;
                break;
            }
        }

        if (semillaCell == null) return;

        int filaBase = semillaCell.Address.RowNumber;
        var items = array.EnumerateArray().ToList();

        if (items.Count == 0)
        {
            ws.Row(filaBase).Clear();
            return;
        }

        if (items.Count > 1)
            ws.Row(filaBase).InsertRowsBelow(items.Count - 1);

        for (int i = 0; i < items.Count; i++)
        {
            int filaActual = filaBase + i;
            var item = items[i];

            if (item.ValueKind == JsonValueKind.Object)
            {
                foreach (var prop in item.EnumerateObject())
                {
                    string subPlaceholder = $"{{{{{prop.Name}}}}}";
                    string valor = prop.Value.ValueKind == JsonValueKind.Null
                        ? ""
                        : prop.Value.ToString();

                    foreach (var cell in ws.Row(filaActual).CellsUsed())
                    {
                        var texto = cell.GetString();
                        if (texto.Contains(subPlaceholder))
                            cell.Value = texto.Replace(subPlaceholder, valor);
                    }
                }
            }
            else
            {
                string valor = item.ValueKind == JsonValueKind.Null ? "" : item.ToString();
                foreach (var cell in ws.Row(filaActual).CellsUsed())
                {
                    var texto = cell.GetString();
                    if (texto.Contains(placeholder))
                        cell.Value = texto.Replace(placeholder, valor);
                }
            }
        }
    }

    private static void InyectarFirmaBase64(IXLWorksheet ws, string placeholder, string base64)
    {
        if (string.IsNullOrWhiteSpace(base64)) return;

        var base64Data = base64.Contains(",") ? base64.Split(',')[1] : base64;

        IXLCell? targetCell = null;
        foreach (var cell in ws.CellsUsed())
        {
            if (cell.GetString().Contains(placeholder))
            {
                targetCell = cell;
                break;
            }
        }

        if (targetCell == null) return;

        try
        {
            byte[] imageBytes = Convert.FromBase64String(base64Data);
            using var ms = new MemoryStream(imageBytes);

            int row = targetCell.Address.RowNumber;
            int col = targetCell.Address.ColumnNumber;

            targetCell.Value = string.Empty;

            ws.AddPicture(ms)
              .MoveTo(ws.Cell(row, col))
              .WithSize(150, 60);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ExcelService] Error al inyectar firma: {ex.Message}");
            targetCell.Value = string.Empty;
        }
    }

    /// <summary>
    /// Limpiador de etiquetas (Regex Cleaner):
    /// Elimina cualquier placeholder {{...}} sobrante antes de exportar.
    /// </summary>
    private static void LimpiarPlaceholders(IXLWorksheet ws)
    {
        var regex = new Regex(@"\{\{.*?\}\}");
        foreach (var cell in ws.CellsUsed())
        {
            if (regex.IsMatch(cell.GetString()))
                cell.Value = string.Empty;
        }
    }
}
