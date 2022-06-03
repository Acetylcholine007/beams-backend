const express = require("express");
const { body } = require("express-validator/check");
const userController = require("../controllers/userController");
const userAuthMW = require("../middlewares/userAuthMW");

const router = express.Router();

router.get("/", userAuthMW, userController.getUsers);

router.get("/:userId", userAuthMW, userController.getUser);

router.patch(
  "/changePassword/:userId",
  [
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Minimum Password length: 5"),
  ],
  userAuthMW,
  userController.editPassword
);

router.patch(
  "/:userId",
  userAuthMW,
  [
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
  ],
  userController.patchUser
);

router.delete("/:userId", userAuthMW, userController.deleteUser);

module.exports = router;
