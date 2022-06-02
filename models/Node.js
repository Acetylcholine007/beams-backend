const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const nodeSchema = new Schema(
  {
    serialKey: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    currentLevel: {
      type: Number,
      default: 0,
    },
    alertThreshold: {
      type: Number,
      required: true,
    },
    alarmThreshold: {
      type: Number,
      required: true,
    },
    criticalThreshold: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Node", nodeSchema);
