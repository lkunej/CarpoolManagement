import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import DatePicker from "react-datepicker";
import Select from 'react-select'
import moment from 'moment'

export class Overview extends Component {
    static displayName = Overview.name;
    constructor(props) {
        super(props);
        this.state = {
            rideSharesPerMonth: {},
            rideShares: [],
            startDate: new Date()
        };
    }

    async componentDidMount() {
        await this.getRideshareDataPerMonth();
        var key = moment().format("MM/yyyy");
        this.setRideshareDataForMonth(key);
        
    }

   
    handleEditButtonClick = (event) => {
        event.preventDefault();
        if (window.confirm("Are you sure you want to delete?") === true) {
            this.editRideShare(event.target.dataset.id);
        }
    }

    handleDateSelection = (event) => {
        const key = moment(event).format("MM/yyyy");
        this.setRideshareDataForMonth(key);
    }

    setRideshareDataForMonth = (key) => {
        const rideShares =  this.state.rideSharesPerMonth[key] || [];
        this.setState({
            rideShares: rideShares
        });
    }

    render() {
        var renderedItems = [];
        if (this.state.rideShares.length > 0) {
            renderedItems = this.state.rideShares.map((item, idx) => {

                var renderedEmployees = [];
                if (item.employees) {
                    renderedEmployees = item.employees.map((emp, idx) => {
                        return (
                            <li key={emp.employeeId}><h5><span className="badge badge-pill badge-light">{emp.name}</span></h5></li>
                        );
                    });
                }

                return (
                    <tr key={item.rideShareId}>
                        <td className="h3 align-middle">{item.startLocation} &#10132; {item.endLocation}</td>
                        <td className="h4 align-middle">{moment(item.startDate).format('DD/MM/YYYY HH:mm')}</td>
                        <td className="h4 align-middle">{moment(item.endDate).format('DD/MM/YYYY HH:mm')}</td>
                        <td className="align-middle">
                            <p className="m-0"><strong>{item.car.name}</strong></p>
                            <p className="m-0">{item.car.type} - {item.car.plates}</p>
                            <p className="m-0">Seats left: {item.car.numOfSeats - item.employees.length} / {item.car.numOfSeats}</p>
                        </td>
                        <td className="align-middle">
                            <ul className="list-unstyled">
                                {renderedEmployees}
                            </ul>
                        </td>
                        <td className="align-middle">
                            <button type="button w-100" className="btn btn-outline-danger btn-block" data-id={item.rideShareId} onClick={this.handleDeleteButtonClick} >Delete</button>
                        </td>
                    </tr>
                );
            });
        }


        return (
            <div className="container">
                <div className="row">
                    <div>
                        <h2>
                            Rideshares Per Month:
                        </h2>
                    </div>
                    <div>
                        <h4 htmlFor="start-date" className="d-block">Select Month:</h4>
                        <DatePicker
                            id="month-selector"
                            selected={this.state.startDate}
                            onSelect={this.handleDateSelection}
                            onChange={(date) => this.setState({ startDate: date })}
                            dateFormat="MM/yyyy"
                            showMonthYearPicker
                            showFullMonthYearPicker
                        />
                    </div>                    
                </div>
                <div className="row">
                    <div id="rideshare-list-container" className="container">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">Relation</th>
                                    <th scope="col">Start (day/month/year)</th>
                                    <th scope="col">End (day/month/year)</th>
                                    <th scope="col">Car</th>
                                    <th scope="col">Employees</th>
                                    <th scope="col">Actions</th>
                                </tr>
                                {renderedItems}
                            </thead>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    async getRideshareDataPerMonth() {
        const response = await fetch('api/rideshares/getRidesharesGroupedByMonth');
        const data = await response.json();
        if (data.success) {
            this.setState({ rideSharesPerMonth: data.rideShares.rideShares });
        } else {
            alert(data.message);
        }
    }
}
