using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CarpoolManagement.Models
{
    public class Employee
    {
        [Key]
        public int EmployeeId { get; set; }
        public string Name { get; set; }
        public bool IsDriver { get; set; }
        public ICollection<RideShare> RideShares {get; set;}
    }
}
