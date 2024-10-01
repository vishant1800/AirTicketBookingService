const { ValidationError, AppError } = require('../utils/errors/index');
const { Booking } = require('../models/index');
const { StatusCodes } = require('http-status-codes');

class BookingRepository {
    async create (data) {
        try {
            const booking = await Booking.create(data);
            return booking;
        } catch (error) {
            if(error.name == 'SequelizeValidationError'){
                throw new ValidationError(error);
            }
            throw new AppError(
                'RepositoryError',
                'Cannot create booking',
                'There was some issue in creating a booking, please try later',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }
}

module.exports = BookingRepository;