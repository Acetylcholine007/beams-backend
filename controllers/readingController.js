const { validationResult } = require("express-validator/check");
const { DateTime } = require("luxon");
const Reading = require("../models/Reading");
const io = require("../utils/socket");

exports.getReading = async (req, res, next) => {
  try {
    let reading = await Reading.findOne({
      serialKey: req.params.serialKey,
    })
      .sort({ datetime: -1 })
      .limit(1);

    if (!reading) {
      const error = new Error("No Readings");
      error.statusCode = 422;
      throw error;
    }
    res.status(200).json({
      reading,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getReadings = async (req, res, next) => {
  try {
    const newDatetime = DateTime.fromISO(req.query.datetime);
    let readings = await Reading.find({
      serialKey: req.query.serialKey,
      datetime: {
        $gte: newDatetime,
        $lt: newDatetime.plus({ minutes: 1 }),
      },
    }).sort({ datetime: 1 });

    res.status(200).json({
      readings,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postReading = async (req, res, next) => {
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

    await reading.save();

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

    res.status(200).json({ success: true });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
