const { validationResult } = require("express-validator/check");
const { DateTime } = require("luxon");
const Reading = require("../models/Reading");
const io = require("../utils/socket");

exports.testPostReading = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Failed to pass validation");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const reading = new Reading({
      serialKey: req.body.serialKey,
      rawX: req.body.rawX,
      rawY: req.body.rawY,
      rawZ: req.body.rawZ,
      fftX: req.body.fftX,
      fftY: req.body.fftY,
      fftZ: req.body.fftZ,
      rawDatetime: req.body.rawDatetime,
      fftFrequency: req.body.fftFrequency,
      datetime: req.body.datetime,
    });

    const newReading = { ...reading.toObject() };

    newReading.rawDatetime = newReading.rawDatetime.map((stamp) =>
      DateTime.fromISO(stamp.toISOString())
        .setZone("Asia/Manila")
        .toFormat("ss' sec. 'SSS' ms.'")
    );

    newReading.fftFrequency = newReading.fftFrequency.map(
      (freq) => `${freq} Hz`
    );

    io.getIO().emit(req.body.serialKey, newReading);

    res.status(200).json(reading);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
