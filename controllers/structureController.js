const { validationResult } = require("express-validator/check");
mongoose = require("mongoose");
const Structure = require("../models/Structure");
const Node = require("../models/Node");

exports.getStructures = async (req, res, next) => {
  try {
    const structures = await Structure.find({
      name: { $regex: req.query.query, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .populate("nodes");

    res.status(200).json({
      message: "Structures fetched.",
      structures,
      totalItems: structures.length,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getStructure = async (req, res, next) => {
  try {
    const structure = await Structure.findById(req.params.structureId).populate(
      "nodes"
    );

    res.status(200).json({
      message: "Structure fetched",
      structure,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postStructure = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Failed to pass validation");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const structure = new Structure({
      name: req.body.name,
      description: req.body.description,
      location: req.body.location,
      imageUri: req.body.imageUri,
    });

    await structure.save();
    res.status(200).json({
      message: "Structure added",
      structure,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.patchStructure = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Failed to pass validation");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    const structure = await Structure.findById(req.params.structureId);
    const structure2 = await Structure.findOne({ name: req.body.name });
    if (!structure) {
      const error = new Error("Structure does not exists");
      error.statusCode = 422;
      throw error;
    }

    if (structure.name !== req.body.name && structure2) {
      const error = new Error("Strcuture name already exists");
      error.statusCode = 422;
      throw error;
    }

    structure.name = req.body.name;
    structure.description = req.body.description;
    structure.location = req.body.location;
    structure.nodes = req.body.nodes;
    structure.imageUri = req.body.imageUri;

    await structure.save();
    res.status(200).json({
      message: "Structure updated",
      structure,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteStructure = async (req, res, next) => {
  try {
    if (req.params.structureId === undefined) {
      const error = new Error("No structureId params attached in URL");
      error.statusCode = 422;
      throw error;
    }

    const structure = await Structure.findById(req.params.structureId);

    const sess = await mongoose.startSession();
    sess.startTransaction();
    await structure.remove({ session: sess });
    await sess.commitTransaction();

    res.status(200).json({
      message: "Structure Removed",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
