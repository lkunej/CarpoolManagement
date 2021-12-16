
/********************************** Home **********************************/
export async function populateRideShareData() {
    const response = await fetch('api/rideshares');
    return await response.json();
}

/******************************** Overview ********************************/
export async function getRideshareDataPerMonth() {
    const response = await fetch('api/rideshares/getRidesharesGroupedByMonth');
    return await response.json();
}
export async function deleteRideShare(id) {
    const requestOptions = {
        method: 'DELETE'
    };
    const response = await fetch('api/rideshares/' + id, requestOptions);
    return await response.json();
}

/************************* CreateOrUpdateRideshare *************************/
export async function populateCitiesData() {
    const response = await fetch('api/cities');
    return await response.json();
}
export async function populateCarsData() {
    const response = await fetch('api/cars');
    return await response.json();    
}
export async function populateEmployeesData() {
    const response = await fetch('api/employees');
    return await response.json();
}
export async function getUnavailableDatesForVehicle(carId) {
    const response = await fetch('api/rideshares/vehicle-availability/' + carId);
    return await response.json();
}
export async function postNewRideshare(model) {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(model)
    };
    const response = await fetch('api/rideshares', requestOptions);
    return await response.json();
}
export async function putUpdatedRideshare(id, model) {
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(model)
    };
    const response = await fetch('api/rideshares/' + id, requestOptions);
    return await response.json();    
}
export async function getRideShareToEdit(rideshareId) {
    const response = await fetch('api/rideshares/' + rideshareId);
    return await response.json();
}