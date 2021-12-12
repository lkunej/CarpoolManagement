using CarpoolManagment.DAL;
using CarpoolManagment.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace CarpoolManagment.Services
{
    public class RideSharesService
    {
        private ApplicationDBContext _context;
        
        public RideSharesService(ApplicationDBContext context)
        {
            _context = context;
        }

        /** Method to return a list of RideShare objects **/
        public async Task<List<RideShare>> GetRideShares()
        {
            try
            {
                List<RideShare> res = new List<RideShare>();
                res = await _context.RideShares.ToListAsync();
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
         * 
         * **/
        public async Task CreateRideShare(RideShare rideShare)
        {
            try
            {
                // Check if car exists
                var car = await _context.Cars.FindAsync(rideShare.CarId);
                if (car == null) throw new ValidationException(string.Format("Car with id={0} doesn't exist.", rideShare.CarId));

                // Check if all employees can fit
                if (rideShare.Employees.Count > car.NumOfSeats) throw new ValidationException(string.Format("Only {0} employees can fit in this vehicle.", car.NumOfSeats));

                // Check if at least one employee has a license
                if (!rideShare.Employees.Any(e => e.IsDriver == true)) throw new ValidationException("At least one passenger must be a driver.");

                // Check if car is available
                if (!CheckIfCarIsAvailable(car.CarId, rideShare.StartDate, rideShare.EndDate))
                {
                    throw new ValidationException(string.Format("Car with id={0} isn't available for chosen dates.", rideShare.CarId));
                }

                _context.RideShares.Add(rideShare);
                await _context.SaveChangesAsync();
            }
            catch (Exception e)
            {
                // The below error is a bug in the InMemoryDatabase used for this project.
                // If this error is thrown, the row is still inserted into the DB.
                if(e.Message != "An item with the same key has already been added. Key: 1") throw;
            }
        }

        public async Task UpdateRideShare(RideShare rideShare)
        {
            try
            {
                // Check if car exists
                var car = await _context.Cars.FindAsync(rideShare.CarId);
                if (car == null) throw new ValidationException(string.Format("Car with id={0} doesn't exist.", rideShare.CarId));

                // Check if all employees can fit
                if (rideShare.Employees.Count > car.NumOfSeats) throw new ValidationException(string.Format("Only {0} employees can fit in this vehicle.", car.NumOfSeats));

                // Check if at least one employee has a license
                if (!rideShare.Employees.Any(e => e.IsDriver == true)) throw new ValidationException("At least one passenger must be a driver.");

                // Check if car is available
                if (!CheckIfCarIsAvailable(car.CarId, rideShare.StartDate, rideShare.EndDate, rideShare.RideShareId))
                {
                    throw new ValidationException(string.Format("Car with id={0} isn't available for chosen dates.", rideShare.CarId));
                }

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

        private bool CheckIfCarIsAvailable(int carId, DateTime start, DateTime end, int? rideShareId=null)
        {
            try
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
            catch (Exception e)
            {
                throw;
            }
        }

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
    }
}
