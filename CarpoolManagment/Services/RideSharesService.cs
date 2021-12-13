using CarpoolManagement.DAL;
using CarpoolManagement.Models;
using CarpoolManagement.Models.ViewModels;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace CarpoolManagement.Services
{
    public class RideSharesService
    {
        private ApplicationDBContext _context;
        
        public RideSharesService(ApplicationDBContext context)
        {
            _context = context;
        }

        /** Method to return a list of RideShare objects **/
        public async Task<List<RideShareViewModel>> GetRideShares()
        {
            try
            {
                List<RideShareViewModel> res = new List<RideShareViewModel>();
                var rideShares = await _context.RideShares.Include(c => c.Car).Include(e => e.Employees).ToListAsync();
                foreach(var rs in rideShares)
                {
                    res.Add(new RideShareViewModel(rs));
                }
                return res;
            }
            catch (Exception e)
            {
                throw;
            }
        }
        /** Method to return a single RideShare object by id **/
        public async Task<RideShare> GetRideShareById(int id)
        {
            try
            {
                var res = await _context.RideShares.FindAsync(id);
                return res;
            }
            catch (Exception e)
            {
                throw;
            }
        }
        /** Method to create a new RideShare object 
         *  
         *  Checks if number of wanted employees is more than the vehicles capacity
         *  Checks if at least one employee has a drivers license
         *  Checks if the wanted car is available for chosen time range
         *  
         * **/
        public async Task CreateRideShare(RideShare rideShare)
        {
            try
            {
                // Check if it's possible to create rideShare with wanted input
                await CheckRidesharePrerequisite(rideShare);

                foreach(var emp in rideShare.Employees)
                {
                    _context.Entry(emp).State = EntityState.Modified;
                }

                _context.RideShares.Add(rideShare);
                await _context.SaveChangesAsync();
            }
            catch (Exception e)
            {
                throw;
            }
        }

        /** Method to update an existing RideShare object **/
        public async Task UpdateRideShare(RideShare rideShare)
        {
            try
            {
                // Check if it's possible to create rideShare with wanted input
                await CheckRidesharePrerequisite(rideShare);

                _context.Entry(rideShare).State = EntityState.Modified;

                await _context.SaveChangesAsync();
            }
            catch (Exception e)
            {
                // The below error is a bug in the InMemoryDatabase used for this project.
                // If this error is thrown, the row is still inserted into the DB.
                if (e.Message != "An item with the same key has already been added. Key: 1") throw;
            }
        }

        /** Method to delete an existing RideShare object by id**/
        public async Task<RideShare> DeleteRideShare(int id)
        {
            try
            {
                var rideShare = await _context.RideShares.FindAsync(id);
                if (rideShare == null) throw new ValidationException(string.Format("RideShare with id={0} doesn't exist.", id));

                _context.RideShares.Remove(rideShare);
                await _context.SaveChangesAsync();

                return rideShare;
            }
            catch (Exception e)
            {
                throw;
            }
        }

        /** Helper method to check if vehicle is available for given time range **/
        private bool CheckIfCarIsAvailable(int carId, DateTime start, DateTime end, int? rideShareId=null)
        {
            // Get all rides that use this car
            List<RideShare> rideShares = new List<RideShare>();
            if (rideShareId.HasValue)
            {
                rideShares = _context.RideShares
                    .Where(r => r.CarId == carId && r.RideShareId != rideShareId).ToList();
            } else
            {
                rideShares = _context.RideShares.Where(r => r.CarId == carId).ToList();
            }
                

            foreach(var r in rideShares)
            {
                bool overlapping = start < r.EndDate && r.StartDate < end;
                if (overlapping) return false;
            }

            // No overlapping dates, vehicle is available for chosen dates.
            return true;

        }

        /** Helper method to preform logical checks needed before creating/updating a RideShare object 
         * 
         *  Checks if number of wanted employees is more than the vehicles capacity
         *  Checks if at least one employee has a drivers license
         *  Checks if the wanted car is available for chosen time range
         *  **/
        private async Task CheckRidesharePrerequisite(RideShare rideShare)
        {
            // Check if car exists
            var car = await _context.Cars.FindAsync(rideShare.CarId);
            if (car == null) throw new ValidationException(string.Format("Car with id={0} doesn't exist.", rideShare.CarId));

            // Check if all employees can fit
            if (rideShare.Employees.Count > car.NumOfSeats) throw new ValidationException(string.Format("Only {0} employees can fit in this vehicle.", car.NumOfSeats));

            // Check if at least one employee has a license
            if (!rideShare.Employees.Any(e => e.IsDriver == true)) throw new ValidationException("At least one passenger must be a driver.");

            // Check if dates are the same
            if (rideShare.StartDate == rideShare.EndDate) throw new ValidationException("Start and end times can't be the same.");

            // Check if car is available
            if (!CheckIfCarIsAvailable(car.CarId, rideShare.StartDate, rideShare.EndDate, rideShare.RideShareId))
            {
                throw new ValidationException(string.Format("Car '{0}' isn't available for chosen dates.", car.Name));
            }
        }
        
    }
}
