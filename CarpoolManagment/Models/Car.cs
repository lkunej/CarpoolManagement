using System.ComponentModel.DataAnnotations;

namespace CarpoolManagement.Models
{
    public class Car
    {
        [Key]
        public int CarId { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Color { get; set; }
        public string Plates { get; set; }
        public int NumOfSeats { get; set; }
    }
}
