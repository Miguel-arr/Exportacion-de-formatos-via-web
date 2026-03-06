using ClosedXML.Excel;
using System.Text.Json;
using System.Text.RegularExpressions;

public class ExcelService
{
    private readonly IWebHostEnvironment _env;

    public ExcelService(IWebHostEnvironment env)
    {
        _env = env;
    }

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

        // Primero procesamos las listas dinámicas (ejecutores, etc.)
        foreach (var kvp in datos.Where(d => d.Value.ValueKind == JsonValueKind.Array))
        {
            ProcesarListaDinamica(ws, kvp.Key, kvp.Value);
        }

        // Luego procesamos los valores simples y firmas fuera de listas
        foreach (var kvp in datos.Where(d => d.Value.ValueKind != JsonValueKind.Array))
        {
            string placeholder = $"{{{{{kvp.Key}}}}}";

            if (kvp.Value.ValueKind == JsonValueKind.Object)
            {
                if (kvp.Value.TryGetProperty("firma_base64", out var base64El))
                {
                    string base64 = base64El.GetString() ?? "";
                    InyectarFirmaBase64(ws, placeholder, base64);
                }
            }
            else
            {
                string valor = kvp.Value.ValueKind == JsonValueKind.Null ? "" : kvp.Value.ToString();
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

    private static void ProcesarListaDinamica(IXLWorksheet ws, string key, JsonElement array)
    {
        var items = array.EnumerateArray().ToList();
        if (items.Count == 0) return;

        // Intentar encontrar la fila semilla basada en el nombre de la lista
        string prefijo = key.EndsWith("es") ? key.Substring(0, key.Length - 2) : 
                        key.EndsWith("s") ? key.Substring(0, key.Length - 1) : key;
        
        IXLRow? filaSemilla = null;
        foreach (var cell in ws.CellsUsed())
        {
            string texto = cell.GetString();
            if (texto.Contains($"{{{{{prefijo}_"))
            {
                filaSemilla = cell.WorksheetRow();
                break;
            }
        }

        if (filaSemilla == null) return;

        int filaBase = filaSemilla.RowNumber();

        // Si hay más de un elemento, insertamos y clonamos formato
        if (items.Count > 1)
        {
            ws.Row(filaBase).InsertRowsBelow(items.Count - 1);
            
            for (int i = 1; i < items.Count; i++)
            {
                var nuevaFila = ws.Row(filaBase + i);
                nuevaFila.Height = filaSemilla.Height;
                
                foreach (var cell in filaSemilla.Cells())
                {
                    var nuevaCelda = nuevaFila.Cell(cell.Address.ColumnNumber);
                    nuevaCelda.Value = cell.Value;
                    nuevaCelda.Style = cell.Style;
                }
            }
        }

        // Llenamos los datos en cada fila
        for (int i = 0; i < items.Count; i++)
        {
            var item = items[i];
            var filaActual = ws.Row(filaBase + i);

            if (item.ValueKind == JsonValueKind.Object)
            {
                foreach (var prop in item.EnumerateObject())
                {
                    string subPlaceholder = $"{{{{{prop.Name}}}}}";

                    // Buscar la celda que contiene el placeholder en la fila actual
                    foreach (var cell in filaActual.Cells())
                    {
                        var textoCelda = cell.GetString();
                        if (textoCelda.Contains(subPlaceholder))
                        {
                            // DETECTAR SI ES UN OBJETO DE FIRMA { firma_base64: "..." }
                            if (prop.Value.ValueKind == JsonValueKind.Object &&
                                prop.Value.TryGetProperty("firma_base64", out var base64El))
                            {
                                string base64Str = base64El.GetString() ?? "";
                                if (!string.IsNullOrWhiteSpace(base64Str))
                                    InyectarFirmaEnCelda(ws, cell, base64Str);
                                else
                                    cell.Value = string.Empty;
                            }
                            else if (prop.Value.ValueKind == JsonValueKind.Null)
                            {
                                cell.Value = string.Empty;
                            }
                            else
                            {
                                string valorRaw = prop.Value.ToString();
                                cell.Value = textoCelda.Replace(subPlaceholder, valorRaw);
                                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                                cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                            }
                        }
                    }
                }
            }
        }
    }

    private static void InyectarFirmaEnCelda(IXLWorksheet ws, IXLCell targetCell, string base64)
    {
        if (string.IsNullOrWhiteSpace(base64)) return;
        try
        {
            // Limpieza robusta de Base64: quitar encabezados y espacios/saltos de línea
            string cleanBase64 = base64;
            if (cleanBase64.Contains(","))
            {
                cleanBase64 = cleanBase64.Split(',')[1];
            }
            cleanBase64 = cleanBase64.Trim().Replace("\n", "").Replace("\r", "");

            byte[] imageBytes = Convert.FromBase64String(cleanBase64);
            using var ms = new MemoryStream(imageBytes);
            
            targetCell.Value = string.Empty;

            var picture = ws.AddPicture(ms)
              .MoveTo(targetCell)
              .WithSize(100, 40);
        }
        catch (Exception ex)
        { 
            targetCell.Value = "Error Firma: " + ex.Message.Substring(0, Math.Min(20, ex.Message.Length)); 
        }
    }

    private static void InyectarFirmaBase64(IXLWorksheet ws, string placeholder, string base64)
    {
        if (string.IsNullOrWhiteSpace(base64)) return;
        IXLCell? targetCell = ws.CellsUsed().FirstOrDefault(c => c.GetString().Contains(placeholder));
        if (targetCell != null)
        {
            InyectarFirmaEnCelda(ws, targetCell, base64);
        }
    }

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
