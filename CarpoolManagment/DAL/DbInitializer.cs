﻿using CarpoolManagment.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace CarpoolManagment.DAL
{
    public class DbInitializer : IDbInitializer
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public DbInitializer(IServiceScopeFactory scopeFactory)
        {
            this._scopeFactory = scopeFactory;
        }

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
                    context.SaveChanges();
                }
            }
        }
    }
}
