const express = require("express");
const { body } = require("express-validator/check");

const User = require("../models/User");
const authController = require("../controllers/authController");
const userVerificationMW = require("../middlewares/userVerificationMW");

const router = express.Router();

router.post(
  "/user/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email address already exists");
          }
        });
      })
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Minimum Password length: 5"),
    body("firstname")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter First Name"),
    body("lastname")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter Last Name"),
    body("contactNo")
      .trim()
      .not()
      .isEmpty()
      .withMessage("Please enter Contact No."),
  ],
  authController.signup
);

router.post(
  "/user/login",
  [
    body("email").isEmail().trim().not().isEmpty(),
    body("password").trim().not().isEmpty(),
  ],
  authController.login
);

router.get(
  "/user/verify/:verificationToken",
  userVerificationMW,
  authController.verifyUser
);

router.get(
  "/user/resetPasswordForm/:uid",
  authController.resetPasswordForm
);

router.post(
  "/user/resetPassword/:uid",
  authController.resetPassword
);

router.post(
  "/user/sendResetPassword",
  [body("email").isEmail().trim().not().isEmpty()],
  authController.sendResetPassword
);

router.post(
  "/user/sendVerification",
  [body("email").isEmail().trim().not().isEmpty()],
  authController.sendVerification
);

module.exports = router;
