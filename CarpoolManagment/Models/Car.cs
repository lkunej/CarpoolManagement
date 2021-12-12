using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarpoolManagment.Models
{
    public class Car
    {
        public int CarId { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Color { get; set; }
        public string Plates { get; set; }
        public int NumOfSeats { get; set; }
    }
}
