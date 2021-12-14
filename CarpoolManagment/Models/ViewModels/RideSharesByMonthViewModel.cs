using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace CarpoolManagement.Models.ViewModels
{
    public class RideSharesByMonthViewModel
    {
        public RideSharesByMonthViewModel()
        {
            RideShares = new Dictionary<string, List<RideShareViewModel>>();
        }

        [Required]
        public Dictionary<string, List<RideShareViewModel>> RideShares { get; set; }
    }
}
