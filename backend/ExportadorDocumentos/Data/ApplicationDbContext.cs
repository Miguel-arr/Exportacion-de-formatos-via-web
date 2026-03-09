using Microsoft.EntityFrameworkCore;
using ExportadorDocumentos.Models;

namespace ExportadorDocumentos.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Ejecutor> Ejecutores { get; set; }
        public DbSet<Altura> Alturas { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuración para la tabla Clientes
            modelBuilder.Entity<Cliente>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Cc).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Displayname).HasMaxLength(255);
                entity.Property(e => e.Password).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Created_at).HasColumnType("timestamp with time zone").HasDefaultValueSql("NOW()");
            });

            // Configuración para la tabla Alturas
            modelBuilder.Entity<Altura>(entity =>
            {
                entity.HasKey(e => e.Id);
                // Propiedades del formulario de Alturas (ejemplo, ajustar según el formulario completo)
                entity.Property(e => e.Fecha_permiso).HasColumnType("date");
                entity.Property(e => e.Hora_inicio).HasColumnType("time");
                entity.Property(e => e.Hora_fin).HasColumnType("time");
                entity.Property(e => e.Area_trabajo).HasMaxLength(255);
                entity.Property(e => e.Ubicacion_trabajo).HasMaxLength(255);
                entity.Property(e => e.Altura_maxima);
                entity.Property(e => e.Descripcion_trabajo).HasColumnType("text");
                // ... añadir más propiedades según el formulario de Alturas
            });

            // Configuración para la tabla Ejecutores
            modelBuilder.Entity<Ejecutor>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Altura_id);
                entity.Property(e => e.Ejecutor_nombres).HasMaxLength(255);
                entity.Property(e => e.Ejecutor_doc).HasMaxLength(20);
                entity.Property(e => e.Ejecutor_cargo).HasMaxLength(100);
                entity.Property(e => e.Ejec_examen).HasMaxLength(10);
                entity.Property(e => e.Ejec_certificado).HasMaxLength(10);
                entity.Property(e => e.Ejec_ss).HasMaxLength(10);
                entity.Property(e => e.Ejec_anclajes).HasMaxLength(10);
                entity.Property(e => e.Ejec_alcohol).HasMaxLength(10);
                entity.Property(e => e.Firma_ejecutor_base64).HasColumnType("text");

                entity.HasOne<Altura>()
                      .WithMany() // Si Altura no tiene una colección de Ejecutores, usar WithMany()
                      .HasForeignKey(e => e.Altura_id)
                      .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
