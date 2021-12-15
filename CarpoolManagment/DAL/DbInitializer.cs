using CarpoolManagement.Models;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace CarpoolManagement.DAL
{
    public class DbInitializer : IDbInitializer
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public DbInitializer(IServiceScopeFactory scopeFactory)
        {
            this._scopeFactory = scopeFactory;
        }

        /** Method to prepoulate database with seed data for cars, cities and employees**/
        public void SeedData()
        {
            using (var serviceScope = _scopeFactory.CreateScope())
            {
                using (var context = serviceScope.ServiceProvider.GetService<ApplicationDBContext>())
                {

                    // Add Cars                    
                    if (!context.Cars.Any())
                    {
                        using (StreamReader r = new StreamReader("DAL/DBFixtures/cars.json"))
                        {
                            string json = r.ReadToEnd();
                            List<Car> cars = JsonConvert.DeserializeObject<List<Car>>(json);
                            context.Cars.AddRange(cars);
                        }                        
                    }
                    // Add Employees                    
                    if (!context.Employees.Any())
                    {
                        using (StreamReader r = new StreamReader("DAL/DBFixtures/employees.json"))
                        {
                            string json = r.ReadToEnd();
                            List<Employee> emps = JsonConvert.DeserializeObject<List<Employee>>(json);
                            context.Employees.AddRange(emps);
                        }
                    }

                    // Add Cities                  
                    if (!context.Cities.Any())
                    {
                        using (StreamReader r = new StreamReader("DAL/DBFixtures/hr_cities.json"))
                        {
                            string json = r.ReadToEnd();
                            List<City> cities = JsonConvert.DeserializeObject<List<City>>(json);
                            context.Cities.AddRange(cities);
                        }
                    }

                    context.SaveChanges();
                }
            }
        }
    }
}
