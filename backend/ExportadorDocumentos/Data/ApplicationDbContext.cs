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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Cliente>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Nombre).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Cc).IsRequired().HasMaxLength(20);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Displayname).HasMaxLength(255);
                entity.Property(e => e.Password).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Created_at).HasColumnType("timestamp with time zone").HasDefaultValueSql("NOW()");
                
                entity.HasIndex(e => e.Username).IsUnique();
                entity.HasIndex(e => e.Cc).IsUnique();
            });
        }
    }
}
