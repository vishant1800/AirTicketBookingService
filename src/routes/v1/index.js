const { BookingController } = require('../../controllers/index')
const express = require('express');

const router = express.Router();

router.post('/booking', BookingController.create);
router.patch('/booking/:id', BookingController.update);

module.exports = router;