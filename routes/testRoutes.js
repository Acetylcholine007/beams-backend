const express = require("express");

const testController = require("../controllers/testController");

const router = express.Router();

router.post("/postRead", testController.testPostReading);

module.exports = router;

