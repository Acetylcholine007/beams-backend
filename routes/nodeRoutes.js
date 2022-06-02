const express = require("express");
const { body } = require("express-validator/check");

const nodeController = require("../controllers/nodeController");
const userAuthMW = require("../middlewares/userAuthMW");

const router = express.Router();
const Node = require("../models/Node");

router.get("/", nodeController.gatNodes);

router.get("/:nodeId", userAuthMW, nodeController.getNode);

router.post(
  "/",
  userAuthMW,
  [
    body("serialKey")
      .trim()
      .not()
      .isEmpty()
      .custom((value, { req }) => {
        if (value.length !== 11) {
          return Promise.reject("Serial key should be 11 character String");
        }
        return Node.findOne({ serialKey: value }).then((nodeDoc) => {
          if (nodeDoc) {
            return Promise.reject("Buoy with the same serial already exist");
          }
        });
      }),
    body("alertThreshold").not().isEmpty().withMessage("Enter Alert Threshold"),
    body("alarmThreshold").not().isEmpty().withMessage("Enter Alarm Threshold"),
    body("criticalThreshold")
      .not()
      .isEmpty()
      .withMessage("Enter Critical Threshold"),
  ],
  nodeController.postNode
);

router.patch(
  "/:nodeId",
  [
    body("alertThreshold").not().isEmpty().withMessage("Enter Alert Threshold"),
    body("alarmThreshold").not().isEmpty().withMessage("Enter Alarm Threshold"),
    body("criticalThreshold")
      .not()
      .isEmpty()
      .withMessage("Enter Critical Threshold"),
  ],
  userAuthMW,
  nodeController.patchNode
);

router.delete("/:nodeId", userAuthMW, nodeController.deleteNode);

module.exports = router;
