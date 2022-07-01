const mongoose = require("mongoose");
const Reading = require("./Reading");
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
    saveMode: {
      type: Boolean,
      default: true
    },
    structure: { type: Schema.Types.ObjectId, ref: "Structure" },
  },
  { timestamps: true }
);

nodeSchema.post("remove", async function (res, next) {
  console.log(this.serialKey);
  await Reading.deleteMany({ serialKey: this.serialKey });
  next();
});

module.exports = mongoose.model("Node", nodeSchema);
