const { validationResult } = require("express-validator/check");

const Node = require("../models/Node");
const Reading = require("../models/Reading");

exports.gatNodes = async (req, res, next) => {
  try {
    const nodes = await Node.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Nodes fetched successfully.",
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
    const node = await Node.findById(req.params.nodeId);
    let readings = await Reading.find({
      serialKey: node.serialKey,
    }).sort({ datetime: -1 });

    readings.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

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

    const node = new Node({
      serialKey: req.body.serialKey,
      point: req.body.point,
      structure: req.body.structure,
    });

    await node.save();
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

    node.serialKey = req.body.serialKey;
    node.point = req.body.point;
    node.structure = req.body.structure;

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

    await Node.findByIdAndRemove(req.params.nodeId);

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
