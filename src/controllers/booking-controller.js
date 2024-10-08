const { StatusCodes } = require('http-status-codes')

const { BookingService } = require('../services/index')

const bookingService = new BookingService();

const create = async (req, res) => {
    try {
        const response = await bookingService.createBooking(req.body);
        console.log("FROM BOOKING CONTROLLER", response);
        return res.status(StatusCodes.OK).json({
            message: 'Successfully completed booking',
            success: true,
            err: {},
            data: response
        })
    } catch (error) {
        console.log("FROM BOOKING CONTROLLER", error);
        return res.status(error.statusCode).json({
            message: error.message,
            success: false,
            err: error.explanation,
            data: {}
        })
    }
}

const update = async (req, res) => {
    try {
        const response = await bookingService.updateBooking(req.params.id);
        console.log("FROM BOOKING CONTROLLER", response);
        return res.status(StatusCodes.OK).json({
            message: 'Successfully updated the booking',
            success: true,
            err: {},
            data: response
        })
    } catch (error) {
        console.log("FROM BOOKING CONTROLLER", error);
        return res.status(error.statusCode).json({
            message: error.message,
            success: false,
            err: error.explanation,
            data: {}
        })
    }
}

module.exports = {
    create,
    update
}