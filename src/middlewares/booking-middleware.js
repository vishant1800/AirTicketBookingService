const { StatusCodes } = require('http-status-codes');

const validateCreateBooking = (req, res, next) => {
    const createdAt = new Date();
    const bookingDate = new Date(req.body.bookingDate);

    if (bookingDate < createdAt) {

        return res.status(StatusCodes.NOT_ACCEPTABLE).json({
            data: {},
            success: false,
            message: 'Booking date cannot be less than current date',
            err: 'Invalid booking date for creating booking'
        })
    }
    next();
}

module.exports = {
    validateCreateBooking
}