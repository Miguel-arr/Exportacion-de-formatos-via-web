using ClosedXML.Excel;
using Microsoft.AspNetCore.Hosting;

public class ExcelService
{
    private readonly IWebHostEnvironment _env;

    public ExcelService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public byte[] GenerarExcelConFirma(PermisoTrabajoRequest req)
    {
        string templatePath = Path.Combine(
            _env.ContentRootPath,
            "Templates",
            "ALTURAS.xlsx" // ESTE ES TU ARCHIVO REAL
        );

        Console.WriteLine("Buscando en:");
        Console.WriteLine(templatePath);
        Console.WriteLine("Existe?: " + File.Exists(templatePath));

        if (!File.Exists(templatePath))
            throw new FileNotFoundException("Plantilla no encontrada");

        using var workbook = new XLWorkbook(templatePath);
        var ws = workbook.Worksheet(1);

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

        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }
}