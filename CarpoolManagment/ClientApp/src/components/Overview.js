import React, { Component, useState } from 'react';
import { PieChart } from 'react-minimal-pie-chart';
import DatePicker from "react-datepicker";
import moment from 'moment'
import { getRideshareDataPerMonth } from '../API/ApiHelper';

export class Overview extends Component {
    static displayName = Overview.name;
    constructor(props) {
        super(props);
        this.state = {
            rideSharesPerMonth: {},
            rideShares: [],
            startDate: new Date(),
            hovered: null
        };
    }

    async componentDidMount() {
        const response = await getRideshareDataPerMonth();
        if (response.success) {
            this.setState({ rideSharesPerMonth: response.rideShares.rideShares });
        } else {
            alert(response.message);
        }
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

    getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    render() {
        var renderedItems = [];
        var pieChartData = [];
        var renderedLegends = [];
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

            var ridesPerCar = {}
            this.state.rideShares.forEach((rideshare) => {
                if (!(rideshare.car.name in ridesPerCar)) {
                    ridesPerCar[rideshare.car.name] = 1
                } else {
                    ridesPerCar[rideshare.car.name] += 1
                }                
            });            

            for (const [key, value] of Object.entries(ridesPerCar)) {
                var randomColor = this.getRandomColor();
                var dataPoint = {
                    title: key,
                    value: value,
                    color: randomColor,
                    tooltip: value
                }
                pieChartData.push(dataPoint);
            }
            
            renderedLegends = pieChartData.map((data) => {
                return (
                    <li key={data.title} style={{ color: data.color, fontSize: '20px'}}><strong>{data.title}</strong></li>
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
                <div className="row">
                    <div className="row">
                        <h2>Number Of Rides:</h2>
                    </div>
                    <div className="row">
                        <div className="col-md-10">
                            <PieChart
                                data={pieChartData}
                                style={{ height: '30vh' }}
                                lineWidth={20}
                                paddingAngle={18}
                                rounded
                                animate
                                label={({ dataEntry }) => dataEntry.value}
                                labelStyle={(index) => ({
                                    fill: pieChartData[index].color,
                                    fontSize: '12px',
                                    fontFamily: 'sans-serif',
                                })}
                                labelPosition={60}
                            />;
                        </div>
                        <div className="col-md-2">
                            <h4>Legend:</h4>
                            <ul className="list-unstyled">
                                {renderedLegends}
                            </ul>
                        </div>
                        
                    </div>
                </div>
            </div>
        );
    }
}
