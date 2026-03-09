using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExportadorDocumentos.Models
{
    public class Cliente
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(255)]
        public string Nombre { get; set; }

        [Required]
        [StringLength(20)]
        public string Cc { get; set; }

        [Required]
        [StringLength(50)]
        public string Username { get; set; }

        [StringLength(255)]
        public string Displayname { get; set; }

        [Required]
        [StringLength(255)]
        public string Password { get; set; }

        [Column(TypeName = "timestamp with time zone")]
        public DateTime Created_at { get; set; }
    }
}
