const { BookingController } = require('../../controllers/index')
const { BookingMiddleware } = require('../../middlewares/index')
const express = require('express');


//const {createChannel} = require('../../utils/messageQueue');

//const channel = await createChannel();
const bookingController = new BookingController();

const router = express.Router();


router.post('/booking',
    BookingMiddleware.validateCreateBooking,
    bookingController.create);
router.patch('/booking/:id', bookingController.update);

module.exports = router;