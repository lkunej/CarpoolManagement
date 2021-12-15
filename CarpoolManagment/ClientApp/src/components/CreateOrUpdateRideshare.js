import React, { Component } from 'react';
import DatePicker from "react-datepicker";
import Select from 'react-select'
import moment from 'moment'
import {
    populateCitiesData, populateCarsData,
    populateEmployeesData, getUnavailableDatesForVehicle,
    postNewRideshare, putUpdatedRideshare,
    getRideShareToEdit
} from '../API/ApiHelper';

import "react-datepicker/dist/react-datepicker.css";

export class CreateOrUpdateRideshare extends Component {
    static displayName = CreateOrUpdateRideshare.name;
    constructor(props) {
        super(props);
        var startDate = new Date();
        var minutes = startDate.getMinutes();
        // round to next half hour
        startDate.setSeconds(0, 0);
        if (minutes < 30) {
            startDate.setMinutes(30);
        } else if (minutes >= 30) {
            startDate.setHours(startDate.getHours() + 1);
            startDate.setMinutes(0);            
        }
        
        this.state = {
            cities: [],
            cars: [],
            selectedCar: null,
            employees: [],
            employeesValues: [],
            selectedEmployees: [],
            startLoc: null,
            endLoc: null,
            startDate: startDate,
            endDate: startDate,
            errorMessage: null,
            excludedDatesDict: {},
            excludedDates: [],
            excludedEmployeeDatesDict: {},
            excludedEmployeeDates: [],
            minTime: new Date(new Date().setHours(startDate.getHours(), startDate.getMinutes(), 0, 0)),
            maxTime: new Date(new Date().setHours(23, 59, 0, 0)),
            rideshareToEditId: this.props.match.params.id || null,
            rideShareToEdit: null
        };
    }

    async componentDidMount() {
        const cities = await populateCitiesData();
        const cars = await populateCarsData();
        const employees = await populateEmployeesData();
        this.setState({
            cities: cities,
            cars: cars,
            employees: employees
        }, () => {
            if (this.state.rideshareToEditId) {
                this.prepopulateFields();
            }
        });
    }

    /** Function to prepopulate input fields if the page is opened for editing a rideshare */
    async prepopulateFields() {
        const response = await getRideShareToEdit(this.state.rideshareToEditId);
        if (response.success === true) {
            this.setState({
                rideShareToEdit: response.rideShare
            });
        }
        const defaultEmployees = this.createDefaultEmployeeValues(this.state.rideShareToEdit.employees);
        const startLoc = (this.state.cities.find(x => x.name === this.state.rideShareToEdit.startLocation))
        const endLoc = (this.state.cities.find(x => x.name === this.state.rideShareToEdit.endLocation))
        const selectedCar = this.state.rideShareToEdit.car
        this.setState({
            selectedCar: selectedCar,
            selectedEmployees: this.state.rideShareToEdit.employees,
            employeesValues: defaultEmployees,
            startLoc: { value: startLoc.cityId, label: startLoc.name },
            endLoc: { value: endLoc.cityId, label: endLoc.name },
            startDate: new Date(this.state.rideShareToEdit.startDate),
            endDate: new Date(this.state.rideShareToEdit.endDate),
        })
        await this.setExcludedDates(await getUnavailableDatesForVehicle(selectedCar.carId));
    }

    /** Helper function to create options for employees dropdown **/
    createDefaultEmployeeValues(defaultEmployees) {
        return defaultEmployees.map((item, idx) => {
            return (
                { value: item, label: item.name }
            );
        });
        
    }

    /** Helper function to find excluded dates for t**/
    async setExcludedDates(response) {
        if (response.success === true) {
            var key = moment(this.state.startDate).format("MM/DD/yyyy");
            var excludedDates = response.unavailableDates[key] ? response.unavailableDates[key].map(x => new Date(x)) : []
            this.setState({
                excludedDatesDict: response.unavailableDates,
                excludedDates: excludedDates
            });
        }
    }

    /******** Handlers for when inputs are changed or form is submitted ********/
    handleCarChange = async(event) => {
        var selectedCar = this.state.cars.find(x => x.name === event.target.value)
        if (selectedCar) {
            await this.setExcludedDates(await getUnavailableDatesForVehicle(selectedCar.carId));
            this.setState({
                selectedCar: selectedCar
            });
        }
    }
    handleEmployeeChange = (event) => {
        var labels = event.map(o => o.label)
        const filtered = event.filter(({ label }, index) => !labels.includes(label, index + 1))
        var selectedEmployees = filtered.map(item => {
            return item.value
        })
        this.setState({
            selectedEmployees: selectedEmployees,
            employeesValues: filtered
        });

        // Need to rethink logic for combining unavailable employee/vehicle dates.
        //this.getUnavailableDatesForEmployees(selectedEmployees);
    }
    handleSubmit = async(event) => {
        event.preventDefault();
        var model = {
            "RideShareId": this.state.rideshareToEditId || 0,
            "StartLocation": this.state.startLoc ? this.state.startLoc.label : null,
            "EndLocation": this.state.endLoc ? this.state.endLoc.label : null,
            "StartDate": this.state.startDate,
            "EndDate": this.state.endDate,
            "CarId": this.state.selectedCar ? this.state.selectedCar.carId : null,
            "Employees": this.state.selectedEmployees
        }
        if (!this.state.rideshareToEditId) {          
            this.handleSubmitResponse(await postNewRideshare(model));
        } else {
            this.handleSubmitResponse(await putUpdatedRideshare(this.state.rideshareToEditId, model));
        }   
    }
    handleDateSelection = (event) => {
        var todayKey = moment(event).format("MM/DD/yyyy");
        var excludedDates = this.state.excludedDatesDict[todayKey] ? this.state.excludedDatesDict[todayKey].map(x => new Date(x)) : [];

        const date = new Date();
        const isSelectedDateInFuture = event.toDateString() != date.toDateString();

        var currentMins = date.getMinutes();
        var currentHours = date.getHours();
        var minTime = new Date().setHours(currentHours, currentMins, 0, 0);
        var maxTime = new Date(new Date().setHours(23, 59, 0, 0));
        if (isSelectedDateInFuture) {
            minTime = null;
            maxTime = null;
        }

        this.setState({
            excludedDates: excludedDates,
            minTime: minTime,
            maxTime: maxTime
        });
    }
    handleSubmitResponse(response) {
        // handle response from backend
        if (response.success === true) {
            window.location = "/";
        } else if (response.success === false) {
            // handle response from backend
            this.setState({
                errorMessage: response.message
            });
        } else {
            // handle frontend validation errors
            if (response.title) {
                this.setState({
                    errorMessage: "Please check form data and try again."
                });
            }
        }
    }

    render() {
        var renderedCities = [];
        if (this.state.cities.length > 0) {
            renderedCities = this.state.cities.map((item, idx) => {
                return (
                    { value: item.cityId, label: item.name }
                );
            });
        }

        var renderedCars = [];
        if (this.state.cars.length > 0) {
            renderedCars = this.state.cars.map((item, idx) => {
                if (this.state.selectedCar) {
                    if (this.state.selectedCar.name === item.name) {
                        return (
                            <option selected key={item.carId}>
                                {item.name}
                            </option>
                        );
                    } else {
                        return (
                            <option key={item.carId}>
                                {item.name}
                            </option>
                        );
                    }
                } else {
                    return (
                        <option key={item.carId}>
                            {item.name}
                        </option>
                    );
                }                          
            });
        }

        var renderedEmployees = [];
        if (this.state.employees.length > 0) {
            renderedEmployees = this.state.employees.map((item, idx) => {
                return (
                    { value: item, label: item.name }
                );
            });
        }

        var renderedSelectedEmployees = [];
        if (this.state.selectedEmployees.length > 0) {
            renderedSelectedEmployees = this.state.selectedEmployees.map((item, idx) => {
                return (
                    <tr key={item.employeeId}>
                        <td>{item.name}</td>
                        <td>{item.isDriver === true ? "Yes" : "No"}</td>
                    </tr>
                );
            });
        }

        var renderedButton = this.state.rideshareToEditId ?
            <button type="submit" className="btn btn-primary float-right">Update</button>
            :
            <button type="submit" className="btn btn-primary float-right">Create</button>

        var startLocationLabel = this.state.startLoc ? this.state.startLoc.label : ""
        var endLocationLabel = this.state.endLoc ? this.state.endLoc.label : ""


        return (                
            <div id="create-rideshare-container" className="container">
                {   this.state.errorMessage && 
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>{this.state.errorMessage}</strong>
                    <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => this.setState({ errorMessage: null})  }>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                }
                
                <div className="row">
                    <h2>Create new Rideshare:</h2>
                    <form className="m-3" onSubmit={this.handleSubmit}>
                        <div className="form-row">
                            <div className="form-group w-100">
                                <label htmlFor="car-dropdown" className="d-block">Choose Vehicle:</label>
                                <select id="car-choice" className="d-block form-select" onChange = { this.handleCarChange } >
                                    <option>Choose...</option>
                                    {renderedCars}
                                </select>
                            </div>
                        </div>
                        {
                            this.state.selectedCar && this.state.selectedEmployees.length > this.state.selectedCar.numOfSeats &&
                            <div className="alert alert-warning" role="alert">
                                <p> The number of employees exceeds vehicles capacity. </p>
                            </div>
                        }
                        <div className="form-row">
                            <div className="form-group w-100">
                                <label htmlFor="employee-dropdown" className="d-block">Choose Employees:</label>
                                <Select
                                    isMulti
                                    onChange={this.handleEmployeeChange}
                                    name="employees"
                                    options={renderedEmployees}
                                    className="basic-multi-select d-block"
                                    classNamePrefix="select"
                                    value={this.state.employeesValues}
                                    
                                />
                            </div>
                        </div>
                        <hr />
                        <div className="form-group">
                            <div className="form-row">
                                <div className="col-md-6">
                                    <label htmlFor="start-location" className="d-block">Start Location:</label>
                                    <Select
                                        onChange={(city) => { this.setState({ startLoc: city })}}
                                        name="start-locations"
                                        options={renderedCities}
                                        className="basic-multi-select d-block"
                                        classNamePrefix="select"
                                        value={this.state.startLoc}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="start-date" className="d-block">Start Date:</label>
                                    <DatePicker
                                        id="start-date"
                                        className="form-control"
                                        showTime={{ use12hours: false }}
                                        selected={this.state.startDate}
                                        onChange={(date) => this.setState({ startDate: date })}
                                        showTimeSelect
                                        minDate={new Date()}
                                        minTime={this.state.minTime}
                                        maxTime={this.state.maxTime}
                                        excludeTimes={this.state.excludedDates}
                                        dateFormat="Pp"
                                        timeFormat="HH:mm"
                                        onSelect={this.handleDateSelection}
                                    />
                                </div>
                            </div>              
                            <div className="form-row mt-3 mb-3">
                                <div className="col-md-6">
                                    <label htmlFor="end-location" className="d-block">End Location:</label>
                                    <Select
                                        onChange={(city) => { this.setState({ endLoc: city }) }}
                                        name="end-locations"
                                        options={renderedCities}
                                        className="basic-multi-select d-block"
                                        classNamePrefix="select"
                                        value={this.state.endLoc}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="end-date" className="d-block">End Date:</label>
                                    <DatePicker
                                        id="end-date"
                                        className="form-control"
                                        excludeOutOfBoundsTimes
                                        showTime={{ use12hours: false }}
                                        selected={this.state.endDate}
                                        onChange={(date) => this.setState({ endDate: date })}
                                        showTimeSelect
                                        minDate={this.state.startDate}
                                        minTime={this.state.minTime}
                                        maxTime={this.state.maxTime}
                                        excludeTimes={this.state.excludedDates}
                                        dateFormat="Pp"
                                        timeFormat="HH:mm"
                                    />
                                </div>
                            </div>                            
                        </div>
                        <hr />
                        <div className="row mt-1 mb-1">
                            <div className="row mb-3"><h3>Rideshare Summary: </h3></div>
                            <div className="row mt-1">
                                {(this.state.startLoc || this.state.endLoc) &&
                                    <div className="row">
                                        <h4>Basic Trip Info:</h4>
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Relation</th>
                                                    <th scope="col">Start Date (DD/MM/YYYY)</th>
                                                    <th scope="col">End Date (DD/MM/YYYY)</th>
                                                </tr>
                                                <tr>
                                                    <td>{startLocationLabel} &#10132; {endLocationLabel}</td>
                                                    <td>{moment(this.state.startDate).format('DD/MM/YYYY HH:mm')}</td>
                                                    <td>{moment(this.state.endDate).format('DD/MM/YYYY HH:mm')}</td>
                                                </tr>
                                            </thead>
                                        </table>

                                    </div>
                                }
                            </div>
                            <div className="row mt-1">
                                {this.state.selectedCar &&
                                    <div className="row">
                                        <h4>Vehicle Information:</h4>
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th scope="col">Name</th>
                                                    <th scope="col">Type</th>
                                                    <th scope="col">Color</th>
                                                    <th scope="col">Plates</th>
                                                    <th scope="col">Number of seats</th>
                                                </tr>
                                                <tr>
                                                    <td>{this.state.selectedCar.name}</td>
                                                    <td>{this.state.selectedCar.type}</td>
                                                    <td>{this.state.selectedCar.color}</td>
                                                    <td>{this.state.selectedCar.plates}</td>
                                                    <td>{this.state.selectedCar.numOfSeats}</td>
                                                </tr>
                                            </thead>
                                        </table>

                                    </div>
                                }
                            </div>
                            <div className="row mt-1">
                                {
                                    this.state.selectedEmployees.length > 0 ?
                                        this.state.selectedEmployees.some(e => e.isDriver === true) ?
                                            <div className="row">
                                                <h4>Employee Information:</h4>
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">Name</th>
                                                            <th scope="col">Has License</th>
                                                        </tr>
                                                        {renderedSelectedEmployees}
                                                    </thead>
                                                </table>
                                            </div>
                                            :
                                            <div className="row">
                                                <div className="alert alert-warning" role="alert">
                                                    <p> None of the passengers have a drivers license. </p>
                                                </div>
                                                <h4>Employee Information:</h4>
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th scope="col">Name</th>
                                                            <th scope="col">Has License</th>
                                                        </tr>
                                                        {renderedSelectedEmployees}
                                                    </thead>
                                                </table>
                                            </div>
                                        :
                                        null
                                }
                            </div>
                        </div>
                        {renderedButton}
                    </form>
                </div>
                    
            </div>
        );
    }

    // TODO - Need to rethink logic for combining vehicle and employee unavailable dates.
    async getUnavailableDatesForEmployees(selectedEmployees) {
        if (selectedEmployees.length > 0) {
            var model = selectedEmployees.map(x => x.employeeId);

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(model)
            };
            const response = await fetch('api/rideshares/employee-availability', requestOptions);
            const data = await response.json();

            if (data.success === true) {
                var todayKey = moment(new Date()).format("MM/DD/yyyy");
                var excludedEmployeeDates = data.unavailableDates[todayKey] ? data.unavailableDates[todayKey].map(x => new Date(x)) : []
                this.setState({
                    excludedDatesEmployeeDict: data.unavailableDates,
                    excludedEmployeeDates: excludedEmployeeDates
                });
            }
        }
    }
}
