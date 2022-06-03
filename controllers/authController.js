const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendMail = require("../utils/sendMail");
const ejs = require("ejs");
const path = require("path");
const { validationResult } = require("express-validator/check");

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Failed to pass validation");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const password = req.body.password;
    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({
      firstname,
      lastname,
      email,
      password: hashedPw,
    });
    const result = await user.save();

    const verificationToken = jwt.sign(
      {
        verifyEmail: req.body.email,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    console.log(verificationToken);

    const htmlTemplate = await ejs.renderFile(
      path.join(__dirname, "../views/emailVerification.ejs"),
      { verificationToken }
    );
    sendMail.sendMail(req.body.email, "VERIFY EMAIL", htmlTemplate);

    res
      .status(200)
      .json({ message: "User created", data: { userId: result._id } });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    const user = await User.findOne({ email: email });
    if (!user) {
      const error = new Error("Email does not exist");
      error.statusCode = 401;
      throw error;
    }
    if (!user.isVerified) {
      const error = new Error(
        "Account Not verified. Check your inbox or spam for verification email."
      );
      error.statusCode = 403;
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Incorrect password");
      error.statusCode = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      },
      process.env.SECRET_KEY
      // { expiresIn: "1h" }
    );
    res.status(200).json({
      message: "Successfully logged In",
      user: {
        token: token,
        userId: loadedUser._id.toString(),
        firstname: loadedUser.firstname,
        lastname: loadedUser.lastname,
        accountType: loadedUser.accountType,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.verifyUser = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.verifyEmail });
    console.log(user);
    if (!user) {
      const error = new Error("Email does not exist");
      error.statusCode = 401;
      throw error;
    }
    user.isVerified = true;
    await user.save();

    res.render("verificationResult", {
      message: "Verification successful",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.uid);
    if (!user) {
      res.render("resetPasswordResult", {
        message: "Password Reset unsuccessful, user not found.",
      });
    }

    if (req.body.newPassword !== req.body.confirmPassword) {
      res.render("resetPasswordForm", {
        uid: req.params.uid,
        isValid: false,
      });
    }

    const password = req.body.newPassword;
    const hashedPw = await bcrypt.hash(password, 12);
    user.password = hashedPw;
    await user.save();

    res.render("resetPasswordResult", {
      message: "Password Reset successful",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.resetPasswordForm = async (req, res, next) => {
  try {
    res.render("resetPasswordForm", {
      uid: req.params.uid,
      isValid: true,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.sendResetPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if(!user) {
      const error = new Error("Email does not exist");
      error.statusCode = 401;
      throw error;
    }
    const uid = user._id.toString();
    console.log(uid);

    const htmlTemplate = await ejs.renderFile(
      path.join(__dirname, "../views/resetPasswordLink.ejs"),
      { uid }
    );
    await sendMail.sendMail(
      req.body.email,
      "RESET PASSWORD LINK",
      htmlTemplate
    );

    res.status(200).json({
      message: "Password reset link was sent to your email",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.sendVerification = async (req, res, next) => {
  try {
    const verificationToken = jwt.sign(
      {
        verifyEmail: req.body.email,
      },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    console.log(verificationToken);

    const htmlTemplate = await ejs.renderFile(
      path.join(__dirname, "../views/emailVerification.ejs"),
      { verificationToken }
    );
    sendMail.sendMail(req.body.email, "VERIFY EMAIL", htmlTemplate);

    res.status(200).json({
      message: "Verification email sent",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
