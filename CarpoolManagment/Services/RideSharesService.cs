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
                var rideShares = await _context.RideShares.Include(c => c.Car)
                                                          .Include(e => e.Employees)
                                                          .OrderByDescending(rs => rs.StartDate)
                                                          .ToListAsync();
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
        public async Task<RideShareViewModel> GetRideShareById(int id)
        {
            try
            {
                var rideShare = await _context.RideShares.Include(c => c.Car).Include(e => e.Employees).FirstOrDefaultAsync(i => i.RideShareId == id);
                RideShareViewModel res = new RideShareViewModel(rideShare);
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

        /** Method to update an existing RideShare object 
         * 
         *  Checks if number of wanted employees is more than the vehicles capacity
         *  Checks if at least one employee has a drivers license
         *  Checks if the wanted car is available for chosen time range
         *  
         * **/
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

        // TODO: Implement filtering for past dates.
        /** Method to get range of dates when vehicle is unavailable grouped by date
         * 
         *  params: carId
         *  return: Dictionary with key/values of (string)Date/OrderedSet of
         *          unavailable dates.
         *  
         * **/
        public Dictionary<string, SortedSet<DateTime>> GetUnavailableDatesForVehicle(int carId)
        {
            try
            {
                Dictionary<string, SortedSet<DateTime>> res = new Dictionary<string, SortedSet<DateTime>>();

                // Get all rideshares for vehicle
                var rideShares = _context.RideShares
                                   .Where(r => r.CarId == carId).ToList();                

                // Return empty list, there are no rideshares yet.
                if (rideShares.Count == 0) return res;

                foreach (var rs in rideShares)
                {                    
                    var tmpStartDate = rs.StartDate;
                    while (tmpStartDate <= rs.EndDate)
                    {
                        if (tmpStartDate.Hour == 23) tmpStartDate = tmpStartDate.AddDays(1);
                        // Create key name in MM/DD/YYYY format
                        var key = tmpStartDate.Date.ToShortDateString();
                        // Create a time range with 30 min intervals between Start and End dates
                        var timeRange = CreateFillInTimeRangeSortedSet(rs.StartDate, rs.EndDate);
                        if (!res.ContainsKey(key))
                        {
                            res.Add(key, timeRange);
                        }
                        else
                        {
                            res[key].UnionWith(timeRange);
                        }
                        tmpStartDate = tmpStartDate.AddMinutes(30);
                    }
                    
                }

                /** Check if there are any dates that only have 30 minutes.
                 *  Rideshares are booked on a 30min bases, so if there is a single
                 *  30min slot, it shouldn't be available.
                 *  
                 *  e.g.
                 *  vechicle booked from 10:00-12:00, then from 12:30-16:30.
                 *      - This leaves a gap of only 30mins between 12:00 and 12:30
                 *        which is to short to book a new rideshare
                 * **/
                foreach (KeyValuePair<string, SortedSet<DateTime>> entry in res)
                {
                    List<DateTime> singleDatesToAdd = new List<DateTime>();
                    var dates = entry.Value.ToList();
                    for (int i = 0; i < dates.Count - 2; i++)
                    {
                        if (dates[i + 1].Subtract(dates[i]).TotalMinutes == 60)
                        {
                            singleDatesToAdd.Add(dates[i].AddMinutes(30));
                        }
                    }
                    res[entry.Key].UnionWith(singleDatesToAdd);
                }

                return res;
            }
            catch (Exception e)
            {
                throw;
            }
        }

        /** Helper method to create a list of DateTimes between startDate and endDate with 30 minute intervals **/
        private SortedSet<DateTime> CreateFillInTimeRangeSortedSet(DateTime startDate, DateTime endDate)
        {
            SortedSet<DateTime> dateList = new SortedSet<DateTime>();
            while (startDate.AddMinutes(30) <= endDate)
            {
                dateList.Add(startDate);
                startDate = startDate.AddMinutes(30);

            }
            return dateList;
        }

        /** Helper method to check if vehicle is available for given time range **/
        private bool CheckIfCarIsAvailable(int carId, DateTime start, DateTime end, int? rideShareId = null)
        {
            // Get all rides that use this car
            List<RideShare> rideShares = new List<RideShare>();
            if (rideShareId.HasValue)
            {
                /** rideShareId.HasValueThis - This means it's an update of an existing rideshare, 
                 *  so must exclude it from availability check
                **/
                rideShares = _context.RideShares
                    .Where(r => r.CarId == carId && r.RideShareId != rideShareId).ToList();
            }
            else
            {
                rideShares = _context.RideShares.Where(r => r.CarId == carId).ToList();
            }


            foreach (var r in rideShares)
            {
                bool overlapping = start < r.EndDate && r.StartDate < end;
                if (overlapping) return false;
            }

            // No overlapping dates, vehicle is available for chosen dates.
            return true;

        }

        /** Method to get rideshares grouped by month
         *  return: Dictionary<string, List<RideShareViewModel>> with key/values of (string)Date(MM/YYYY)/List of
         *          rideshares for month.
         * **/
        public async Task<RideSharesByMonthViewModel> GetRidesharesGroupedByMonth()
        {
            try
            {
                RideSharesByMonthViewModel res = new RideSharesByMonthViewModel();

                // Query to get rideshares grouped by year+month
                var rideShares = _context.RideShares.Include(c => c.Car)
                                                    .Include(e => e.Employees)
                                                    .ToLookup(g => new { g.StartDate.Year, g.StartDate.Month });

                foreach (var group in rideShares)
                {
                    var month = group.Key.Month.ToString();
                    if (month.Length == 1) month = '0' + month;

                    // Create key in format MM/YYYY
                    var key = string.Format("{0}/{1}", month, group.Key.Year);
                    res.RideShares[key] = new List<RideShareViewModel>();
                    foreach (var rideShare in group)
                    {
                        res.RideShares[key].Add(new RideShareViewModel(rideShare));
                    }
                }
                return res;
            }
            catch (Exception e)
            {
                throw;
            }
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
            if (rideShare.StartDate >= rideShare.EndDate) throw new ValidationException("End date must be after start date.");

            // Check if car is available
            if (!CheckIfCarIsAvailable(car.CarId, rideShare.StartDate, rideShare.EndDate, rideShare.RideShareId))
            {
                throw new ValidationException(string.Format("Car '{0}' isn't available for chosen dates.", car.Name));
            }
        }

        /* TODO - Not used currently, need to rethink logic about joining with unavailable vehicle dates*/
        public async Task<Dictionary<string, SortedSet<DateTime>>> GetUnavailableDatesForEmployees(ICollection<int> employeeIds)
        {
            try
            {
                Dictionary<string, SortedSet<DateTime>> res = new Dictionary<string, SortedSet<DateTime>>();

                var rideShares = await _context.RideShares.Include(c => c.Car)
                                                          .Include(e => e.Employees.Where(x => employeeIds.Contains(x.EmployeeId)))
                                                          .OrderByDescending(rs => rs.StartDate)
                                                          .ToListAsync();

                foreach (int id in employeeIds)
                {                 

                    // Return empty list, there are no rideshares yet.
                    if (rideShares.Count == 0) return res;

                    foreach (var rs in rideShares.Where(x => x.Employees.Count > 0))
                    {
                        var tmpStartDate = rs.StartDate;
                        while (tmpStartDate <= rs.EndDate)
                        {
                            if (tmpStartDate.Hour == 23) tmpStartDate = tmpStartDate.AddDays(1);
                            var key = tmpStartDate.Date.ToShortDateString();
                            var timeRange = CreateFillInTimeRangeSortedSet(rs.StartDate, rs.EndDate);
                            if (!res.ContainsKey(key))
                            {
                                res.Add(key, timeRange);
                            }
                            else
                            {
                                res[key].UnionWith(timeRange);
                            }
                            tmpStartDate = tmpStartDate.AddMinutes(30);
                        }

                    }

                    foreach (KeyValuePair<string, SortedSet<DateTime>> entry in res)
                    {
                        List<DateTime> singleDatesToAdd = new List<DateTime>();
                        var dates = entry.Value.ToList();
                        for (int i = 0; i < dates.Count - 2; i++)
                        {
                            if (dates[i + 1].Subtract(dates[i]).TotalMinutes == 60)
                            {
                                singleDatesToAdd.Add(dates[i].AddMinutes(30));
                            }
                        }
                        res[entry.Key].UnionWith(singleDatesToAdd);
                    }
                }                

                return res;
            }
            catch (Exception e)
            {
                throw;
            }
        }

        
        
    }
}
