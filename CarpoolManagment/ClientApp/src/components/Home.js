import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment'

export class Home extends Component {
    static displayName = Home.name;
    constructor(props) {
        super(props);
        this.state = {
            rideShares: []
        };
    }

    componentDidMount() {
        this.populateRideShareData();
    }

    handleDeleteButtonClick = (event) => {
        event.preventDefault();
        if (window.confirm("Are you sure you want to delete?") === true) {
            this.deleteRideShare(event.target.dataset.id)
        }        
    }

    removeRideshareFromList = (id) => {
        var rideShares = this.state.rideShares;
        var toRemoveIndex = rideShares.findIndex(x => x.rideShareId == id);
        if (toRemoveIndex > -1) {
            rideShares.splice(toRemoveIndex, 1);
        }
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
                            <Link to={"/edit/" + item.rideShareId}>
                                <button type="button w-100" className="btn btn-outline-primary btn-block">Edit</button>
                            </Link>
                            <button type="button w-100" className="btn btn-outline-danger btn-block" data-id={item.rideShareId} onClick={this.handleDeleteButtonClick} >Delete</button>
                        </td>
                    </tr>
                );
            });
        }
        

        return (
            <div>
                <h2>
                    Rideshares:
                </h2>
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
                
                <Link to="/create" className="btn btn-primary float-right" onClick={this.incrementCounter}>Create New Rideshare</Link>
            </div>
        );
  }

    async populateRideShareData() {
        const response = await fetch('api/rideshares');
        const data = await response.json();
        if (data.success) {
            this.setState({ rideShares: data.rideShares });
        } else {
            alert(data.message);
        }        
    }
    async deleteRideShare(id) {
        const requestOptions = {
            method: 'DELETE'
        };
        const response = await fetch('api/rideshares/'+id, requestOptions);
        const data = await response.json();
        if (data.success) {
            alert(data.message);
            this.removeRideshareFromList(id);
            //window.location.reload()
        } else {
            alert(data.message);
        }
    }
}
