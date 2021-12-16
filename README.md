# CarpoolManagement
A C# .NET Core + React web application for managing carpooling

This application is running with .NET version 5.0.401. This requires a Visual Studio 2019 version of at least 16.8.

If application doesn't run after cloning and trying to run on IIS Express follow these steps:
    1. Right click on project folder
    2. Application tab
    3. Target framework dropdown -> select .NET 5.0

The application runs on an InMemoryDatabase.

This solution contains both backend and frontend.

The frontend application is a React application under the "ClientApp" directory in the project structure.

The solution covers the following:

    Backend:
        - Models for Cars, Cities, Employees and Rideshares and CRUD methods for all
            - Cities table is seeded with a list of Croatian cities.
            - Employee and Car tables are also prepopulated.
            - Only created three tier architecture for RideShares due to lack of time.
              Cars, Cities and Employee services should also be created in this fashion.

        - Other endpoints used for getting meaningfull information from the backend:
            - GetUnavailableDatesForVehicle, GetUnavailableDatesForEmployees (Not used TODO), GetRidesharesGroupedByMonth
            
    Frontend:
         - Homepage where existing rideshares are listed. All items have a delete and edit button.
         - Create/Edit new rideshare page:
             - React multiselect for employees
             - React datepicker for dates
                 - EXTRA FEATURE: When selecting a vehicle from the dropdown, unavailable dates for vehicle are automatically disabled in datepicker!
         - Overview page where you can view rides per month:
              - React datepicker for month selection
              - EXTRA FEATURE: React-minimal-piechart for displaying car usage for selected month.
