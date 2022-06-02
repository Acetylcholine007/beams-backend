const express = require('express');

const readingController = require('../controllers/readingController');

const router = express.Router();

router.get('/:serialKey', readingController.getReading);

router.post('/', readingController.postReading);

module.exports = router;