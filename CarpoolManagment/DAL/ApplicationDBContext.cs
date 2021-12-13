using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using CarpoolManagement.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Newtonsoft.Json;

namespace CarpoolManagement.DAL
{
    public class ApplicationDBContext : DbContext
    {        
        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options) : base(options)
        {
            
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Car>()
                .HasIndex(c => c.Plates)
                .IsUnique();

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
