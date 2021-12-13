using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarpoolManagement.Models.ViewModels
{
    public class RideShareViewModel
    {
        public RideShareViewModel()
        {
            Employees = new List<EmployeeViewModelWithoutRideShares>();
        }

        public RideShareViewModel(RideShare model)
        {
            RideShareId = model.RideShareId;
            StartLocation = model.StartLocation;
            EndLocation = model.EndLocation;
            StartDate = model.StartDate;
            EndDate = model.EndDate;
            CarId = model.CarId;
            Car = model.Car;
            Employees = new List<EmployeeViewModelWithoutRideShares>();
            foreach (var e in model.Employees)
            {
                Employees.Add(new EmployeeViewModelWithoutRideShares(e));
            }
        }
        [Key]
        public int RideShareId { get; set; }
        [Required]
        public string StartLocation { get; set; }
        [Required]
        public string EndLocation { get; set; }
        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        [Required]
        [ForeignKey("Car")]
        public int CarId { get; set; }
        public Car Car { get; set; }
        [Required]
        public List<EmployeeViewModelWithoutRideShares> Employees { get; set; }
        //public List<Employee> Employees { get; set; }
    }

    public class EmployeeViewModelWithoutRideShares
    {
        public EmployeeViewModelWithoutRideShares()
        {

        }

        public EmployeeViewModelWithoutRideShares(Employee model)
        {
            EmployeeId = model.EmployeeId;
            Name = model.Name;
            IsDriver = model.IsDriver;
        }

        [Key]
        public int EmployeeId { get; set; }
        public string Name { get; set; }
        public bool IsDriver { get; set; }
    }
}
