const axios = require('axios');

const { BookingRepository } = require('../repository/index');
const { FLIGHT_SERVICE_PATH } = require('../config/serverConfig');
const { ServiceError } = require('../utils/errors');

class BookingService {
    constructor() {
        this.bookingRepository = new BookingRepository();
    }

    async createBooking(data) {
        try {
            const flightId = data.flightId;
            const getFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${flightId}`;
            const response = await axios.get(getFlightRequestURL);
            const flightData = response.data.data; //axios populate data property
            const priceOfTheFlight = flightData.price;
            if (data.noOfSeats > flightData.totalSeats) {
                return new ServiceError('Something went wrong in the booking process', 'Insufficient seats in the flight')
            }
            const totalCost = priceOfTheFlight * data.noOfSeats;
            const bookingPayload = { ...data, totalCost };  //this will not hamper the data object whereas it creates new data object with all the properties of data object and including totalCost
            const booking = await this.bookingRepository.create(bookingPayload);

            //updating totalSeats in FlightandSearch Service
            const updateFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${booking.flightId}`;
            await axios.patch(updateFlightRequestURL, { totalSeats: flightData.totalSeats - booking.noOfSeats });
            const finalBooking = await this.bookingRepository.update(booking.id, {status: "Booked"});
            return finalBooking;

        } catch (error) {
            if(error.name == 'RepositoryError' || error.name == 'ValidationError'){
                throw error;
            }
            throw new ServiceError();
        }
    }

    async updateBooking(bookingId, data) {
        try {
            const booking = await this.bookingRepository.get(bookingId);
            const getFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${booking.flightId}`;
            const response = await axios.get(getFlightRequestURL);
            const flightData = response.data.data;
            
            if(booking.status != "Cancelled"){
                await axios.patch(getFlightRequestURL, { totalSeats: flightData.totalSeats + booking.noOfSeats });
            }

            const finalUpdate = await this.bookingRepository.update(bookingId, {status: "Cancelled"}); 
            return finalUpdate;
        } catch (error) {
            throw new ServiceError();
        }
    }


}

module.exports = BookingService;