using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExportadorDocumentos.Models
{
    [Table("clientes", Schema = "public")]
    public class Cliente
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("nombre")]
        [StringLength(150)]
        public string? Nombre { get; set; }

        [Column("cc")]
        [StringLength(20)]
        public string? Cc { get; set; }

        [Column("username")]
        [StringLength(100)]
        public string? Username { get; set; }

        [Column("displayname")]
        [StringLength(150)]
        public string? Displayname { get; set; }

        [Column("password")]
        [StringLength(255)]
        public string? Password { get; set; }

        [Column("created_at", TypeName = "timestamp without time zone")]
        public DateTime Created_at { get; set; }
    }
}
