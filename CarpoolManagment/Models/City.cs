using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CarpoolManagement.Models
{
    public class City
    {
        [Key]
        public int CityId { get; set; }
        public string Name { get; set; }
        public double Lat { get; set; }
        public double Lng { get; set; }
        public string Country { get; set; }
        public string Iso2 { get; set; }
        public string AdminName { get; set; }
        public string Capital { get; set; }
        public string Population { get; set; }
        public string PopulationProper { get; set; }
    }
}
