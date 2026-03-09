using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExportadorDocumentos.Models
{
    public class Ejecutor
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("Altura")]
        public int Altura_id { get; set; }

        [StringLength(255)]
        public string Ejecutor_nombres { get; set; }

        [StringLength(20)]
        public string Ejecutor_doc { get; set; }

        [StringLength(100)]
        public string Ejecutor_cargo { get; set; }

        [StringLength(10)]
        public string Ejec_examen { get; set; }

        [StringLength(10)]
        public string Ejec_certificado { get; set; }

        [StringLength(10)]
        public string Ejec_ss { get; set; }

        [StringLength(10)]
        public string Ejec_anclajes { get; set; }

        [StringLength(10)]
        public string Ejec_alcohol { get; set; }

        [Column(TypeName = "text")]
        public string Firma_ejecutor_base64 { get; set; }
    }
}
