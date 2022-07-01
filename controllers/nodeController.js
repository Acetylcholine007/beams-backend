const { validationResult } = require("express-validator/check");
const { DateTime } = require("luxon");
const Node = require("../models/Node");
const Reading = require("../models/Reading");
const Structure = require("../models/Structure");
mongoose = require("mongoose");

exports.getNodes = async (req, res, next) => {
  try {
    const nodes = await Node.find({})
      .sort({ createdAt: -1 })
      .populate("structure");

    res.status(200).json({
      message: "Nodes fetched.",
      nodes,
      totalItems: nodes.length,
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
    const node = await Node.findById(req.params.nodeId).populate("structure");
    if (!node) {
      const error = new Error("Node does not exists");
      error.statusCode = 422;
      throw error;
    }
    let latestReading = await Reading.findOne({
      serialKey: node.serialKey,
    }).sort({ datetime: -1 });
    let readings = [];
    if (latestReading) {
      const datetime = new Date(latestReading.datetime);
      datetime.setSeconds(0);
      const newDatetime = DateTime.fromJSDate(datetime);
      readings = await Reading.find({
        serialKey: node.serialKey,
        datetime: {
          $gte: newDatetime,
          $lt: newDatetime.plus({ minutes: 1 }),
        },
      }).sort({ datetime: 1 });
    }

    res.status(200).json({
      message: "Node fetched",
      node,
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

    const structure = await Structure.findById(req.body.structure);
    if (!structure) {
      const error = new Error("Structure does not exists");
      error.statusCode = 422;
      throw error;
    }

    const node = new Node({
      serialKey: req.body.serialKey,
      name: req.body.name,
      description: req.body.description,
      structure: req.body.structure,
      saveMode: req.body.saveMode,
      imageUri: req.body.imageUri,
    });

    await node.save();
    structure.nodes.push(node);
    await structure.save();

    res.status(200).json({
      message: "Node added",
      node,
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

    const node = await Node.findById(req.params.nodeId);
    const node2 = await Node.findOne({ serialKey: req.body.serialKey });
    if (!node) {
      const error = new Error("Node does not exists");
      error.statusCode = 422;
      throw error;
    }

    if (node.serialKey !== req.body.serialKey && node2) {
      const error = new Error("Serial key already exists");
      error.statusCode = 422;
      throw error;
    }

    // node.serialKey = req.body.serialKey;
    node.name = req.body.name;
    node.description = req.body.description;
    node.imageUri = req.body.imageUri;
    node.saveMode = req.body.saveMode;

    await node.save();
    res.status(200).json({
      message: "Node updated",
      node,
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
    if (req.params.nodeId === undefined) {
      const error = new Error("No nodeId params attached in URL");
      error.statusCode = 422;
      throw error;
    }

    const node = await Node.findById(req.params.nodeId).populate("structure");

    const sess = await mongoose.startSession();
    sess.startTransaction();
    node.structure.nodes.pull(node);
    await node.structure.save({ session: sess });
    await node.remove({ session: sess });
    await sess.commitTransaction();

    res.status(200).json({
      message: "Node Removed",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
