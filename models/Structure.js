const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const structureSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    imageUri: {
      type: String,
      default: "",
    },
    nodes: [{ type: Schema.Types.ObjectId, ref: "Node" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Structure", structureSchema);
