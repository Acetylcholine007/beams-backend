const express = require("express");
const { body } = require("express-validator/check");

const nodeController = require("../controllers/nodeController");
const userAuthMW = require("../middlewares/userAuthMW");

const router = express.Router();
const Node = require("../models/Node");

router.get("/", nodeController.gatNodes);

router.get("/:nodeId", nodeController.getNode);

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
            return Promise.reject("Node with the same serial already exist");
          }
        });
      }),
      body("point").not().isEmpty().withMessage("Enter Structure point identification"),
      body("structure").not().isEmpty().withMessage("Enter Structure identification"),
  ],
  nodeController.postNode
);

router.patch(
  "/:nodeId",
  userAuthMW,
  [
    body("point").not().isEmpty().withMessage("Enter Structure point identification"),
    body("structure").not().isEmpty().withMessage("Enter Structure identification"),
  ],
  nodeController.patchNode
);

router.delete("/:nodeId", userAuthMW, nodeController.deleteNode);

module.exports = router;
