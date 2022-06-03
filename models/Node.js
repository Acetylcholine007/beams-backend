const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const nodeSchema = new Schema(
  {
    serialKey: {
      type: String,
      required: true,
    },
    point: {
      type: String,
      required: true,
    },
    structure: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Node", nodeSchema);
