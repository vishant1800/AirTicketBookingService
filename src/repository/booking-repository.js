const { ValidationError, AppError } = require('../utils/errors/index');
const { Booking } = require('../models/index');
const { StatusCodes } = require('http-status-codes');

class BookingRepository {
    async create(data) {
        try {
            const booking = await Booking.create(data);
            return booking;
        } catch (error) {
            if (error.name == 'SequelizeValidationError') {
                throw new ValidationError(error);
            }
            throw new AppError(
                'RepositoryError',
                'Cannot create booking',
                'There was some issue creating a booking, please try later',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async update(bookingId, data) {
        try {
            const booking = await Booking.findByPk(bookingId);
            if (data.status) {
                booking.status = data.status;
            }
            await booking.save();
            return booking;
        } catch (error) {
            throw new AppError(
                'RepositoryError',
                'Cannot update booking',
                'There was some issue updating a booking, please try later',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

    async get(bookingId){
        try {
            const booking = await Booking.findByPk(bookingId);
            return booking;
        } catch (error) {
            throw new AppError(
                'RepositoryError',
                'Cannot delete booking',
                'There was some issue deleting a booking, please try later',
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }

}

module.exports = BookingRepository;