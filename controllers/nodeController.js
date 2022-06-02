const { validationResult } = require("express-validator/check");

const Buoy = require("../models/Node");
const Reading = require("../models/Reading");

exports.gatNodes = async (req, res, next) => {
  const perPage = 12;
  const query = req.query.query || "";
  const currentPage = req.query.page || 1;
  let queryTarget;
  switch (req.query.target) {
    case "serialKey":
      queryTarget = "serialKey";
      break;
    case "location":
      queryTarget = "location";
      break;
    default:
      queryTarget = null;
  }
  try {
    const totalItems = await Buoy.find(
      queryTarget ? { [queryTarget]: query } : {}
    ).countDocuments();
    const buoys = await Buoy.find(
      query
        ? queryTarget
          ? { [queryTarget]: { $regex: query, $options: "i" } }
          : {}
        : {}
    )
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "Buoys fetched successfully.",
      buoys,
      totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getNode = async (req, res, next) => {
  try {
    const readingLength = req.query.readingLength || 15;
    const offset = req.query.offset || 0;
    const buoyId = req.params.buoyId;
    const buoy = await Buoy.findById(buoyId);
    let readings = await Reading.find({
      serialKey: buoy.serialKey,
    })
      .sort({ datetime: -1 })
      .skip(offset)
      .limit(readingLength);

    readings.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    res.status(200).json({
      message: "Buoy fetched",
      buoy,
      readings,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postNode = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Failed to pass validation");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const serialKey = req.body.serialKey;
    const location = req.body.location;
    const alertThreshold = req.body.alertThreshold;
    const alarmThreshold = req.body.alarmThreshold;
    const criticalThreshold = req.body.criticalThreshold;

    const buoy = new Buoy({
      serialKey,
      location,
      alertThreshold,
      alarmThreshold,
      criticalThreshold,
    });
    await buoy.save();
    res.status(200).json({
      message: "Buoy added",
      buoy,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.patchNode = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Failed to pass validation");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const buoyId = req.params.buoyId;

    const buoy = await Buoy.findById(buoyId);
    const buoy2 = await Buoy.findOne({ serialKey: req.body.serialKey });
    if (!buoy) {
      const error = new Error("Buoy does not exists");
      error.statusCode = 422;
      throw error;
    }

    if (buoy.serialKey !== req.body.serialKey && buoy2) {
      const error = new Error("Serial key already exists");
      error.statusCode = 422;
      throw error;
    }

    buoy.serialKey = req.body.serialKey;
    buoy.location = req.body.location;
    buoy.alertThreshold = req.body.alertThreshold;
    buoy.alarmThreshold = req.body.alarmThreshold;
    buoy.criticalThreshold = req.body.criticalThreshold;

    await buoy.save();
    res.status(200).json({
      message: "Buoy updated",
      buoy,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteNode = async (req, res, next) => {
  try {
    const buoyId = req.params.buoyId;
    if (buoyId === undefined) {
      const error = new Error("No buoyId params attached in URL");
      error.statusCode = 422;
      throw error;
    }

    await Buoy.findByIdAndRemove(buoyId);

    res.status(200).json({
      message: "Buoy Removed",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
