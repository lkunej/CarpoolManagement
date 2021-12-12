using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CarpoolManagment.Models
{
    public class RideShare
    {
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
        public int CarId { get; set; }
        [Required]
        public List<Employee> Employees { get; set; }
    }
}
