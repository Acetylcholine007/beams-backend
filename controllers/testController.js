const { validationResult } = require("express-validator/check");
const { DateTime } = require("luxon");
const Reading = require("../models/Reading");
const Node = require("../models/Node");
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
    // const dateParts = req.body.date.split("/");
    // const timeParts = req.body.time.split(":");

    // let datetime = DateTime.local({
    //   year: dateParts[2],
    //   day: dateParts[1],
    //   month: dateParts[0],
    //   hour: timeParts[0],
    //   minute: timeParts[1],
    //   second: timeParts[2],
    // }).setZone("Asia/Singapore");

    const reading = new Reading({
      serialKey: req.body.serialKey,
      rawX: req.body.rawX,
      rawY: req.body.rawY,
      rawZ: req.body.rawZ,
      fftX: req.body.fftX,
      fftY: req.body.fftY,
      fftZ: req.body.fftZ,
      rawDatetime: req.body.rawDatetime,
      fftDatetime: req.body.fftDatetime,
      datetime: req.body.datetime,
    });

    // Corrective Logic
    // if (dateParts[2] === "1970") {
    //   datetime = DateTime.now().setLocale("ph");
    //   reading.datetime = datetime;
    // }

    console.log(reading);
    io.getIO().emit(req.body.serialKey, reading);

    res.status(200).json(reading);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
