import React, { Component } from 'react';
import DatePicker from "react-datepicker";
import Select from 'react-select'
import moment from 'moment'

import "react-datepicker/dist/react-datepicker.css";

export class CreateRideshare extends Component {
    static displayName = CreateRideshare.name;
    constructor(props) {
        super(props);
        var startDate = new Date();
        var minutes = startDate.getMinutes();
        // round to next half hour
        startDate.setSeconds(0, 0)
        if (minutes < 30) {
            startDate.setMinutes(30);
        } else if (minutes >= 30) {
            startDate.setHours(startDate.getHours()+1)
            startDate.setMinutes(0);            
        }
        
        this.state = {
            cities: [],
            cars: [],
            selectedCar: null,
            employees: [],
            selectedEmployees: [],
            startLoc: null,
            endLoc: null,
            startDate: startDate,
            endDate: startDate,
            errorMessage: null
        };
    }

    componentDidMount() {
        this.populateCitiesData()
        this.populateCarsData()
        this.populateEmployeesData()
    }

    handleLocationChange = (event) => {
        var city = event.target.value === "Choose..." ? "" : event.target.value;
        if (event.target.id === "start-location") {
            this.setState({ startLoc: city })
        } else {
            this.setState({ endLoc: city })
        }
    }

    handleCarChange = (event) => {
        var selectedCar = this.state.cars.find(x => x.name === event.target.value)
        this.setState({
            selectedCar: selectedCar
        });
    }

    handleEmployeeChange = (event) => {
        var selectedEmployees = event.map(item => {
            return item.value
        })
        this.setState({
            selectedEmployees: selectedEmployees
        });
    }

    handleSubmit = (event) => {
        event.preventDefault();
        this.postNewRideshare();
    }

    render() {

        var renderedCities = [];
        if (this.state.cities.length > 0) {
            renderedCities = this.state.cities.map((item, idx) => {
                return (
                    <option key={item.cityId}>
                        {item.name}
                    </option>
                );
            });
        }

        var renderedCars = [];
        if (this.state.cars.length > 0) {
            renderedCars = this.state.cars.map((item, idx) => {
                return (
                    <option key={item.carId}>
                        {item.name}
                    </option>
                );
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

        const isSelectedDateInFuture = +this.state.startDate > +new Date();

        const date = new Date();
        let currentMins = date.getMinutes();
        let currentHour = date.getHours();
        if (isSelectedDateInFuture) {
            currentHour = 0;
            currentMins = 0;
        }

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
                                <select id="car-choice" className="d-block form-select" onChange={this.handleCarChange}>
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
                                />
                            </div>
                        </div>
                        <hr />
                        <div className="form-group">
                            <div className="form-row">
                                <div className="col-md-6">
                                    <label htmlFor="start-location" className="d-block">Start Location:</label>
                                    <select id="start-location" className="d-block form-select" onChange={this.handleLocationChange}>
                                        <option>Choose...</option>
                                        {renderedCities}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="start-date" className="d-block">Start Date:</label>
                                    <DatePicker
                                        id="start-date"
                                        className="form-control"
                                        showTime={{ use12hours: false }}
                                        selected={this.state.startDate}
                                        onChange={(date) => this.setState({startDate: date})}
                                        showTimeSelect
                                        minDate={new Date()}
                                        minTime={new Date(new Date().setHours(currentHour, currentMins, 0, 0))}
                                        maxTime={new Date(new Date().setHours(23, 59, 0, 0))}
                                        dateFormat="Pp"
                                        timeFormat="HH:mm"
                                    />
                                </div>
                            </div>              
                            <div className="form-row mt-3 mb-3">
                                <div className="col-md-6">
                                    <label htmlFor="end-location" className="d-block">End Location:</label>
                                    <select id="end-location" className="d-block form-select" onChange={this.handleLocationChange}>
                                        <option>Choose...</option>
                                        {renderedCities}
                                    </select>
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
                                        minTime={new Date(new Date().setHours(currentHour, currentMins, 0, 0))}
                                        maxTime={new Date(new Date().setHours(23, 59, 0, 0))}
                                        dateFormat="Pp"
                                        timeFormat="HH:mm"
                                    />
                                </div>
                            </div>                            
                        </div>
                        <hr />
                        <button type="submit" className="btn btn-primary float-right">Create</button>
                    </form>
                </div>
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
                                            <td>{this.state.startLoc} &#10132; {this.state.endLoc}</td>
                                            <td>{ moment(this.state.startDate).format('DD-MM-YYYY HH:mm')}</td>
                                            <td>{ moment(this.state.endDate).format('DD-MM-YYYY HH:mm')}</td>
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
            </div>
        );


    }
    async populateCitiesData() {
        const response = await fetch('api/cities');
        const data = await response.json();
        this.setState({ cities: data });
    }
    async populateCarsData() {
        const response = await fetch('api/cars');
        const data = await response.json();
        this.setState({ cars: data });
    }
    async populateEmployeesData() {
        const response = await fetch('api/employees');
        const data = await response.json();
        this.setState({ employees: data });
    }

    async postNewRideshare() {
        var model = {
            "StartLocation": this.state.startLoc,
            "EndLocation": this.state.endLoc,
            "StartDate": this.state.startDate,
            "EndDate": this.state.endDate,
            "CarId": this.state.selectedCar ? this.state.selectedCar.carId : null,
            "Employees": this.state.selectedEmployees
        }
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(model)
        };
        const response = await fetch('api/rideshares', requestOptions);
        const data = await response.json();
        // handle response from backend
        if (data.success === true) {
            window.location = "/";
        } else if (data.success === false) {
            console.log(data)
            // handle response from backend
            this.setState({
                errorMessage: data.message
            });
        } else {
            // handle frontend validation errors
            if (data.title) {
                this.setState({
                    errorMessage: "Please check form data and try again."
                });
            }
        }

        
    }
}