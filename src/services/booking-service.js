const axios = require('axios');

const { BookingRepository } = require('../repository/index');
const { FLIGHT_SERVICE_PATH, REMINDER_BINDING_KEY, CONFIRMATION_BINDING_KEY } = require('../config/serverConfig');
const { ServiceError } = require('../utils/errors');

const { createChannel, publishMessage } = require('../utils/messageQueue');

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

            console.log("INSIDE BOOKING", booking);
            console.log("DATE CHECK", booking.bookingDate >= booking.createdAt);
            //console.log(booking.bookingDate, booking.currentDate)

            //updating totalSeats in FlightandSearch Service
            const updateFlightRequestURL = `${FLIGHT_SERVICE_PATH}/api/v1/flights/${booking.flightId}`;
            await axios.patch(updateFlightRequestURL, { totalSeats: flightData.totalSeats - booking.noOfSeats });
            const finalBooking = await this.bookingRepository.update(booking.id, { status: "Booked" });


            const channel = await createChannel();
            //Sends immediate confimation mail to the user
            this.confirmationNotification(channel, finalBooking);

            //Sends reminder mail to the user 48 hours prior to boarding
            await this.reminderNotification(channel, finalBooking);

            return finalBooking;

        } catch (error) {
            if (error.name == 'RepositoryError' || error.name == 'ValidationError') {
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

            if (booking.status != "Cancelled") {
                await axios.patch(getFlightRequestURL, { totalSeats: flightData.totalSeats + booking.noOfSeats });
            }

            const finalUpdate = await this.bookingRepository.update(bookingId, { status: "Cancelled" });
            return finalUpdate;
        } catch (error) {
            throw new ServiceError();
        }
    }

    async confirmationNotification(channel, finalBooking) {

        const htmlContent = `<h1>Booking Confirmation</h1>
                    <p>Dear Valued Customer,</p>
                    <p>Thank you for your booking! Below are the details of your flight reservation:</p>

                    <p><span class="highlight">Booking ID:</span> ${finalBooking.id}</p>
                    <p><span class="highlight">Flight ID:</span> ${finalBooking.flightId}</p>
                    <p><span class="highlight">User ID:</span> ${finalBooking.userId}</p>
                    <p><span class="highlight">Status:</span> ${finalBooking.status}</p>
                    <p><span class="highlight">Number of Seats:</span> ${finalBooking.noOfSeats}</p>
                    <p><span class="highlight">Total Cost:</span> ₹${finalBooking.totalCost}</p>
                    <p><span class="highlight">Booking Date:</span> ${new Date(finalBooking.bookingDate).toLocaleString()}</p>

                    <p>We hope you have a pleasant journey!</p>
                    <p>Best regards,</p>
                    <p>Your Airline Team</p>`;

        const payload = {
            data: {
                mailFrom: 'vishant0426@gmail.com',
                mailTo: 'vishant0426@gmail.com',
                subject: 'Ticket confirmation mail',
                text: "Hello user",
                html: htmlContent
            },
            service: "SEND_BASIC_MAIL"
        };
        publishMessage(channel, CONFIRMATION_BINDING_KEY, JSON.stringify(payload));
    }

    async reminderNotification(channel, finalBooking) {
        const flightDate = finalBooking.bookingDate;
        const reminderDate = new Date(flightDate.getTime() - 1 * 60 * 60 * 1000); //date and time 48 hours prior to boarding

        const currentDate = new Date();
        const mailDelay = reminderDate.getTime() - currentDate.getTime();  //delay time in milliseconds

        const subjectContent = `Dear Valued Customer,\nthis is a friendly reminder about your upcoming flight reservation with Booking id ${finalBooking.id}. Thank you for choosing us, and we wish you safe travels!`;

        // Creating ticket in Reminder Service database
        if (mailDelay > 0) {
            setTimeout(function () {
                const payload = {
                    data: {
                        subject: 'Flight reminder mail',
                        content: subjectContent,
                        recepientEmail: 'moneyniboray1246@gmail.com',
                        notificationTime: reminderDate.toISOString()
                    },
                    service: "CREATE_TICKET"
                };
                publishMessage(channel, REMINDER_BINDING_KEY, JSON.stringify(payload));
            }, mailDelay);
        } else {
            console.log("Reminder date has already passed")
        }
    }

}

module.exports = BookingService;