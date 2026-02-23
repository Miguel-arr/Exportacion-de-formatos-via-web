using ClosedXML.Excel;

public class ExcelService
{
    public byte[] GenerarExcelConFirma(PermisoTrabajoRequest req)
    {
        string templatePath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "Templates",
            "TRABAJO ALTURAS GDINGENIERIA SAS.xslx" // Ajusta nombre real
        );

        if (!File.Exists(templatePath))
            throw new FileNotFoundException("Plantilla no encontrada");

        using var workbook = new XLWorkbook(templatePath);
        var ws = workbook.Worksheet(1);

        // 🔹 Reemplazar texto correctamente
        foreach (var cell in ws.CellsUsed())
        {
            if (cell.GetString().Contains("{{FECHA_PERMISO}}"))
                cell.Value = cell.GetString().Replace("{{FECHA_PERMISO}}", req.Fecha);

            if (cell.GetString().Contains("{{HORA_INICIO}}"))
                cell.Value = cell.GetString().Replace("{{HORA_INICIO}}", req.HoraInicio);

            if (cell.GetString().Contains("{{AREA_TRABAJO}}"))
                cell.Value = cell.GetString().Replace("{{AREA_TRABAJO}}", req.Area);

            if (cell.GetString().Contains("{{ALTURA_MAXIMA}}"))
                cell.Value = cell.GetString().Replace("{{ALTURA_MAXIMA}}", req.AlturaMaxima);
        }

        // 🔹 Insertar firma
        if (!string.IsNullOrEmpty(req.ImgFirmaResponsableTarea))
        {
            string pathImg = Path.Combine(
                Directory.GetCurrentDirectory(),
                "assets",
                "firmas",
                req.ImgFirmaResponsableTarea
            );

            if (File.Exists(pathImg))
            {
                ws.AddPicture(pathImg)
                  .MoveTo(ws.Cell("B15"))
                  .Scale(0.8);
            }
        }

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }
}