using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using CarpoolManagement.DAL;
using CarpoolManagement.Models;
using CarpoolManagement.Services;
using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace CarpoolManagement.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RideSharesController : ControllerBase
    {
        private readonly ApplicationDBContext _context;
        private readonly RideSharesService _service;

        public RideSharesController(ApplicationDBContext context)
        {
            _context = context;
            _service = new RideSharesService(_context);
        }

        // GET: api/RideShares
        /** Endpoint to get all Rideshares **/
        [HttpGet]
        public async Task<JsonResult> GetRideShares()
        {
            try
            {
                var rideShares = await _service.GetRideShares();
                return new JsonResult(new
                {
                    success = true,
                    message = "Success",
                    rideShares = rideShares,
                    statusCode = StatusCodes.Status200OK
                });
            }
            catch (Exception e)
            {
                return new JsonResult(new
                {
                    success = false,
                    message = "Something went wrong! Try again later.",
                    statusCode = StatusCodes.Status500InternalServerError
                });
            }
            
        }

        // GET: api/RideShares/1
        /** Endpoint to get a single RideShare object by id **/
        [HttpGet("{id}")]
        public async Task<JsonResult> GetRideShare(int id)
        {
            try
            {
                var rideShare = await _service.GetRideShareById(id);

                if (rideShare == null)
                {
                    return new JsonResult(new
                    {
                        success = false,
                        message = string.Format("RideShare with id {0} not found", id),
                        statusCode = StatusCodes.Status404NotFound
                    });
                }

                return new JsonResult(new
                    {
                        success = true,
                        rideShare = rideShare,
                        message = "Success",
                        statusCode = StatusCodes.Status200OK
                    });
            }
            catch
            {
                return new JsonResult(new
                {
                    success = false,
                    message = "Something went wrong! Try again later.",
                    statusCode = StatusCodes.Status500InternalServerError
                });
            }

            
        }

        // POST: api/RideShares
        /** Endpoint to create a new RideShare object **/
        [HttpPost]
        public async Task<JsonResult> PostRideShare(RideShare rideShare)
        {
            try
            {
                await _service.CreateRideShare(rideShare);

                return new JsonResult(new
                {
                    success = true,
                    message = "Success",
                    statusCode = StatusCodes.Status200OK
                });
            }
            catch (ValidationException ve)
            {
                return new JsonResult(new
                {
                    success = false,
                    message = ve.Message,
                    statusCode = StatusCodes.Status400BadRequest
                });
            }
            catch (Exception e)
            {
                return new JsonResult(new
                {
                    success = false,
                    message = e.Message,
                    statusCode = StatusCodes.Status500InternalServerError
                });
            }
        }

        // PUT: api/RideShares/1
        /** Endpoint to update an existing RideShare object
         *  Params: id -> Id of rideshare object to update
         *          rideShare -> RideShare object with updated info
         * **/
        [HttpPut("{id}")]
        public async Task<JsonResult> PutRideShare(int id, RideShare rideShare)
        {
            try
            {
                if (id != rideShare.RideShareId)
                {
                    return new JsonResult(new
                    {
                        success = false,
                        message = "Bad Request.",
                        statusCode = StatusCodes.Status400BadRequest
                    });
                }

                await _service.UpdateRideShare(rideShare);

                return new JsonResult(new
                {
                    success = true,
                    rideShare = rideShare,
                    message = "Success",
                    statusCode = StatusCodes.Status200OK
                });
            }
            catch (ValidationException e)
            {
                return new JsonResult(new
                {
                    success = false,
                    message = e.Message,
                    statusCode = StatusCodes.Status400BadRequest
                });
            }
            catch (Exception)
            {
                return new JsonResult(new
                {
                    success = false,
                    message = "Something went wrong! Try again later.",
                    statusCode = StatusCodes.Status500InternalServerError
                });
            }
            
        }

        // DELETE: api/RideShares/5
        /** Endpoint to delete a RideShare object by id **/
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRideShare(int id)
        {

            try
            {
                await _service.DeleteRideShare(id);

                return new JsonResult(new
                {
                    success = true,
                    message = "Successfully deleted ride share",
                    statusCode = StatusCodes.Status200OK
                });
            }
            catch (Exception e)
            {
                return new JsonResult(new
                {
                    success = false,
                    message = e.Message,
                    statusCode = StatusCodes.Status500InternalServerError
                });
            }
        }

        // This method should be replaced to CarsController, not sure if I'll have time to seperate service and controller for all.
        /** Endpoint to get a range of dates when vehicle is unavailable 
         *  params: carId
         *  return: JSON result containing success info and message and a dictionary with key/values of (string)Date/OrderedSet of
         *          unavailable dates.
         * **/
        [Route("vehicle-availability/{carId}")]
        public JsonResult GetUnavailableDatesForVehicle(int carId)
        {
            try
            {
                var unavailableDates = _service.GetUnavailableDatesForVehicle(carId);

                return new JsonResult(new
                {
                    success = true,
                    unavailableDates = unavailableDates,
                    message = "Success",
                    statusCode = StatusCodes.Status200OK
                });
            }
            catch
            {
                return new JsonResult(new
                {
                    success = false,
                    message = "Something went wrong! Try again later.",
                    statusCode = StatusCodes.Status500InternalServerError
                });
            }
        }

        /* TODO - Not used currently, need to rethink logic about joining with unavailable vehicle dates
         * This method should be replaced to EmployeesController, not sure if I'll have time to seperate service and controller for all.
         * */
        /** Endpoint to get a range of dates when employees are unavailable 
         *  params: list of employee ids
         *  return: JSON result containing success info and message and a dictionary with key/values of (string)Date/OrderedSet of
         *          unavailable dates.
         * **/
        [HttpPost]
        [Route("employee-availability")]
        public async Task<JsonResult> GetUnavailableDatesForEmployees(ICollection<int> employeeIds)
        {
            try
            {
                var unavailableDates = await _service.GetUnavailableDatesForEmployees(employeeIds);

                return new JsonResult(new
                {
                    success = true,
                    unavailableDates = unavailableDates,
                    message = "Success",
                    statusCode = StatusCodes.Status200OK
                });
            }
            catch
            {
                return new JsonResult(new
                {
                    success = false,
                    message = "Something went wrong! Try again later.",
                    statusCode = StatusCodes.Status500InternalServerError
                });
            }
        }

        /** Endpoint to get rideshares grouped by month
         *  return: JSON result containing success info and message and a dictionary with key/values of (string)Date(MM/YYYY)/List of
         *          rideshares for month.
         * **/
        [Route("getRidesharesGroupedByMonth")]
        public async Task<JsonResult> GetRidesharesGroupedByMonth()
        {
            try
            {
                var rideShares = await _service.GetRidesharesGroupedByMonth();

                return new JsonResult(new
                {
                    success = true,
                    rideShares = rideShares,
                    message = "Success",
                    statusCode = StatusCodes.Status200OK
                });
            }
            catch
            {
                return new JsonResult(new
                {
                    success = false,
                    message = "Something went wrong! Try again later.",
                    statusCode = StatusCodes.Status500InternalServerError
                });
            }
        }
    }
}
