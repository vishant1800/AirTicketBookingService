const { BookingController } = require('../../controllers/index')
const express = require('express');

const router = express.Router();

router.post('/booking', BookingController.create);

module.exports = router;