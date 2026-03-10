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

            // Mapeo explícito a la tabla en minúsculas (como se ve en tu imagen)
            modelBuilder.Entity<Cliente>().ToTable("clientes", schema: "public");
        }
    }
}
