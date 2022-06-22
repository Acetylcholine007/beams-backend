const express = require("express");
const { body } = require("express-validator/check");

const nodeController = require("../controllers/nodeController");
const userAuthMW = require("../middlewares/userAuthMW");

const router = express.Router();
const Node = require("../models/Node");

router.get("/", nodeController.getNodes);

router.get("/:nodeId", nodeController.getNode);

router.post(
  "/",
  userAuthMW,
  [
    body("serialKey")
      .trim()
      .not()
      .isEmpty()
      .custom((value) => {
        if (value.length !== 8) {
          return Promise.reject("Serial key should be 8 character String");
        }
        return Node.findOne({ serialKey: value }).then((nodeDoc) => {
          if (nodeDoc) {
            return Promise.reject("Node with the same serial already exist");
          }
        });
      }),
    body("name").not().isEmpty().withMessage("Node name required"),
    body("description")
      .not()
      .isEmpty()
      .withMessage("Node description required"),
    body("structure").not().isEmpty().withMessage("Structure ID required"),
  ],
  nodeController.postNode
);

router.patch(
  "/:nodeId",
  userAuthMW,
  [
    body("name").not().isEmpty().withMessage("Node name required"),
    body("description")
      .not()
      .isEmpty()
      .withMessage("Node description required"),
  ],
  nodeController.patchNode
);

router.delete("/:nodeId", userAuthMW, nodeController.deleteNode);

module.exports = router;
