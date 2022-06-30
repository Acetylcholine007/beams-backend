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
      .not()
      .isEmpty()
      .trim()
      .isEmail()
      .withMessage("Valid email required")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email address already exists");
          }
        });
      })
      .normalizeEmail({ gmail_remove_dots: false }),
    body("password")
      .not()
      .isEmpty()
      .trim()
      .isLength({ min: 5 })
      .withMessage("Minimum Password length: 5"),
    body("firstname")
      .not()
      .isEmpty()
      .trim()
      .withMessage("First Name required"),
    body("lastname")
      .not()
      .isEmpty()
      .trim()
      .withMessage("Last Name required"),
  ],
  authController.signup
);

router.post(
  "/user/login",
  [
    body("email").not().isEmpty().trim().isEmail().withMessage("Valid email required"),
    body("password").not().isEmpty().trim().withMessage("Password required"),
  ],
  authController.login
);

router.get(
  "/user/verify/:verificationToken",
  userVerificationMW,
  authController.verifyUser
);

router.get("/user/resetPasswordForm/:uid", authController.resetPasswordForm);

router.post("/user/resetPassword/:uid", authController.resetPassword);

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
