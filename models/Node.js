const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const nodeSchema = new Schema(
  {
    serialKey: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUri: {
      type: String,
      default: "",
    },
    structure: { type: Schema.Types.ObjectId, ref: "Structure" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Node", nodeSchema);
