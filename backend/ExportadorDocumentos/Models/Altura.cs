using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ExportadorDocumentos.Models
{
    public class Altura
    {
        [Key]
        public int Id { get; set; }

        [Column(TypeName = "date")]
        public DateTime? Fecha_permiso { get; set; }

        [Column(TypeName = "time")]
        public TimeSpan? Hora_inicio { get; set; }

        [Column(TypeName = "time")]
        public TimeSpan? Hora_fin { get; set; }

        [StringLength(255)]
        public string Area_trabajo { get; set; }

        [StringLength(255)]
        public string Ubicacion_trabajo { get; set; }

        public double? Altura_maxima { get; set; }

        [Column(TypeName = "text")]
        public string Descripcion_trabajo { get; set; }

        public bool Chk_mantenimiento { get; set; }
        public bool Chk_almacenamiento { get; set; }
        public bool Chk_instalacion { get; set; }
        public bool Chk_supervicion { get; set; }
        public bool Chk_orden { get; set; }
        public bool Chk_izaje { get; set; }
        public bool Chk_arme { get; set; }

        [StringLength(255)]
        public string Otros_trabajos { get; set; }

        [StringLength(10)]
        public string Permiso_caliente { get; set; }

        [StringLength(10)]
        public string Permiso_confinados { get; set; }

        [StringLength(10)]
        public string Permiso_electrico { get; set; }

        [StringLength(10)]
        public string Chk_ats { get; set; }

        [StringLength(10)]
        public string Chk_socializacion { get; set; }

        [StringLength(10)]
        public string Chk_optimas { get; set; }

        [StringLength(10)]
        public string Chk_delimitado { get; set; }

        [StringLength(10)]
        public string Chk_rescate { get; set; }

        [StringLength(10)]
        public string Chk_coordinador { get; set; }

        [StringLength(10)]
        public string Chk_clima { get; set; }

        [StringLength(10)]
        public string Chk_izar { get; set; }

        [StringLength(10)]
        public string Chk_portaherramienta { get; set; }

        [StringLength(10)]
        public string Chk_electricidad { get; set; }

        [StringLength(10)]
        public string Chk_verificacion_puntos_anclajes { get; set; }

        [StringLength(10)]
        public string Epp_casco { get; set; }

        [StringLength(10)]
        public string Epp_gafas { get; set; }

        [StringLength(10)]
        public string Epp_dotacion { get; set; }

        [StringLength(10)]
        public string Epp_guantes { get; set; }

        [StringLength(10)]
        public string Epp_calzado { get; set; }

        [StringLength(255)]
        public string Otros_elementos { get; set; }

        [StringLength(10)]
        public string Anclaje_fijo { get; set; }

        [StringLength(10)]
        public string Est_anclaje_fijo { get; set; }

        [StringLength(255)]
        public string Obs_anclaje_fijo { get; set; }

        [StringLength(10)]
        public string Arnes { get; set; }

        [StringLength(10)]
        public string Est_arnes { get; set; }

        [StringLength(255)]
        public string Obs_arnes { get; set; }

        [StringLength(10)]
        public string Anclaje_movil { get; set; }

        [StringLength(10)]
        public string Est_anclaje_movil { get; set; }

        [StringLength(255)]
        public string Obs_anclaje_movil { get; set; }

        [StringLength(10)]
        public string Mosquetones { get; set; }

        [StringLength(10)]
        public string Est_mosquetones { get; set; }

        [StringLength(255)]
        public string Obs_mosquetones { get; set; }

        [StringLength(10)]
        public string Eslinga_detencion { get; set; }

        [StringLength(10)]
        public string Est_eslinga_detencion { get; set; }

        [StringLength(255)]
        public string Obs_eslinga_detencion { get; set; }

        [StringLength(10)]
        public string Frenos { get; set; }

        [StringLength(10)]
        public string Est_frenos { get; set; }

        [StringLength(255)]
        public string Obs_frenos { get; set; }

        [StringLength(10)]
        public string Eslinga_posicionamiento { get; set; }

        [StringLength(10)]
        public string Est_eslinga_posicionamiento { get; set; }

        [StringLength(255)]
        public string Obs_eslinga_posicionamiento { get; set; }

        [StringLength(10)]
        public string Lvh_temporal { get; set; }

        [StringLength(10)]
        public string Est_lvh_temporal { get; set; }

        [StringLength(255)]
        public string Obs_lvh_temporal { get; set; }

        [StringLength(10)]
        public string Lvv_temporal { get; set; }

        [StringLength(10)]
        public string Est_lvv_temporal { get; set; }

        [StringLength(255)]
        public string Obs_lvv_temporal { get; set; }

        [StringLength(10)]
        public string Eslinga_restriccion { get; set; }

        [StringLength(10)]
        public string Est_eslinga_restriccion { get; set; }

        [StringLength(255)]
        public string Obs_eslinga_restriccion { get; set; }

        [StringLength(255)]
        public string Otros_equipos { get; set; }

        [StringLength(10)]
        public string Estado_otros_equipos { get; set; }

        [StringLength(255)]
        public string Obs_otros_equipos { get; set; }

        [StringLength(255)]
        public string Sistema_utilizar { get; set; }

        [StringLength(10)]
        public string Restriccion { get; set; }

        [StringLength(10)]
        public string Posicionamiento { get; set; }

        [StringLength(10)]
        public string Detencion { get; set; }

        [StringLength(10)]
        public string Delimitacion_area { get; set; }

        [StringLength(255)]
        public string Obs_delimitacion_area { get; set; }

        [StringLength(10)]
        public string Barandas { get; set; }

        [StringLength(255)]
        public string Obs_barandas { get; set; }

        [StringLength(10)]
        public string Control_acceso { get; set; }

        [StringLength(255)]
        public string Obs_control_acceso { get; set; }

        [StringLength(10)]
        public string Ayudantes_seguridad { get; set; }

        [StringLength(255)]
        public string Obs_ayudantes_seguridad { get; set; }

        [StringLength(10)]
        public string Lineas_advertencia { get; set; }

        [StringLength(255)]
        public string Obs_lineas_advertencia { get; set; }

        [StringLength(10)]
        public string Otros_medidas { get; set; }

        [StringLength(255)]
        public string Obs_otros_medidas { get; set; }

        [StringLength(10)]
        public string Control_huecos { get; set; }

        [StringLength(10)]
        public string Andamios { get; set; }

        [StringLength(255)]
        public string Obs_andamios { get; set; }

        [StringLength(10)]
        public string Elevadores_personas { get; set; }

        [StringLength(255)]
        public string Obs_elevadores_personas { get; set; }

        [StringLength(10)]
        public string Andamios_colgantes { get; set; }

        [StringLength(255)]
        public string Obs_andamios_colgantes { get; set; }

        [StringLength(10)]
        public string Trabajo_suspension { get; set; }

        [StringLength(255)]
        public string Obs_trabajo_suspension { get; set; }

        [StringLength(10)]
        public string Escaleras_fijas { get; set; }

        [StringLength(255)]
        public string Obs_escaleras_fijas { get; set; }

        [StringLength(10)]
        public string Otros_sistemas { get; set; }

        [StringLength(255)]
        public string Obs_otros_sistemas { get; set; }

        [StringLength(10)]
        public string Escaleras_moviles { get; set; }

        [StringLength(255)]
        public string Obs_escaleras_moviles { get; set; }

        [Column(TypeName = "text")]
        public string Herramientas_utilizar { get; set; }

        public double? Distancia_Caida_libre { get; set; }
        public double? Altura_trabajador { get; set; }
        public double? Longitud_eslinga { get; set; }
        public double? Absorbedor_choque { get; set; }
        public double? Factor_seguridad { get; set; }

        [StringLength(255)]
        public string Nombre_responsable_tarea { get; set; }

        [StringLength(20)]
        public string Doc_responsable_tarea { get; set; }

        [StringLength(100)]
        public string Cargo_responsable_tarea { get; set; }

        [StringLength(255)]
        public string Nombre_coordinador_altura { get; set; }

        [StringLength(20)]
        public string Doc_coordinador_altura { get; set; }

        [StringLength(100)]
        public string Cargo_coordinador_altura { get; set; }

        [StringLength(255)]
        public string Nombre_responsable_emergencia { get; set; }

        [StringLength(20)]
        public string Doc_responsable_emergencia { get; set; }

        [StringLength(100)]
        public string Cargo_responsable_emergencia { get; set; }

        [StringLength(10)]
        public string Tarea_terminada { get; set; }

        [StringLength(10)]
        public string Orden_aseo_realizado { get; set; }

        [StringLength(10)]
        public string Hubo_incidentes { get; set; }

        [StringLength(255)]
        public string Nombre_cierre { get; set; }

        [StringLength(100)]
        public string Cargo_cierre { get; set; }

        [Column(TypeName = "date")]
        public DateTime? Fecha_cierre { get; set; }

        [Column(TypeName = "time")]
        public TimeSpan? Hora_cierre { get; set; }

        [StringLength(255)]
        public string Motivo_cierre { get; set; }

        [Column(TypeName = "text")]
        public string Observaciones_finales { get; set; }
    }
}
