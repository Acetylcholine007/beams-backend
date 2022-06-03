const { validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.getUsers = async (req, res, next) => {
  try {
    const currentPage = req.query.page || 1;
    const perPage = 12;
    const totalItems = await User.find().countDocuments();
    const users = await User.find()
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "Users fetched successfully.",
      users,
      totalItems,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("Could not find user.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "User fetched.", user });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.editPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Failed to pass validation");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const userId = req.params.userId;
    const user = await User.findById(userId);

    const password = req.body.password;
    const hashedPw = await bcrypt.hash(password, 12);

    user.password = hashedPw;
    await user.save();
    res.status(200).json({
      message: "Password updated",
      user,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.patchUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Failed to pass validation");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const userId = req.params.userId;
    const user = await User.findById(userId);

    user.firstname = req.body.firstname;
    user.lastname = req.body.lastname;
    await user.save();
    res.status(200).json({
      message: "User updated",
      user,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    if (userId === undefined) {
      const error = new Error("No userId params attached in URL");
      error.statusCode = 422;
      throw error;
    }

    await User.findByIdAndRemove(userId);

    res.status(200).json({
      message: "User Removed",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
