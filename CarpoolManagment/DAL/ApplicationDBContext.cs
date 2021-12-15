using CarpoolManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace CarpoolManagement.DAL
{
    public class ApplicationDBContext : DbContext
    {        
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options) : base(options)
        {
            
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Add constraint to ensure license plates are unique 
            modelBuilder.Entity<Car>()
                .HasIndex(c => c.Plates)
                .IsUnique();

            // Add many to many relation between employees and rideshares
            modelBuilder.Entity<RideShare>()
                .HasMany(rs => rs.Employees)
                .WithMany(e => e.RideShares);
        }

        public DbSet<Car> Cars { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<RideShare> RideShares { get; set; }
        public DbSet<City> Cities { get; set; }
    }
}
