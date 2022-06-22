const express = require("express");
const { body } = require("express-validator/check");

const structureController = require("../controllers/structureController");
const userAuthMW = require("../middlewares/userAuthMW");

const router = express.Router();

router.get("/", structureController.getStructures);

router.get("/:structureId", structureController.getStructure);

router.post(
  "/",
  userAuthMW,
  [
    body("name").not().isEmpty().withMessage("Structure name required"),
    body("description")
      .not()
      .isEmpty()
      .withMessage("Structure description required"),
    body("location").not().isEmpty().withMessage("Structure location required"),
  ],
  structureController.postStructure
);

router.patch(
  "/:structureId",
  userAuthMW,
  [
    body("name").not().isEmpty().withMessage("Structure name required"),
    body("description")
      .not()
      .isEmpty()
      .withMessage("Structure description required"),
    body("location").not().isEmpty().withMessage("Structure location required"),
  ],
  structureController.patchStructure
);

router.delete("/:structureId", userAuthMW, structureController.deleteStructure);

module.exports = router;
