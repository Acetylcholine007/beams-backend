const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const readingSchema = Schema(
  {
    serialKey: String,
    floodLevel: Number,
    precipitation: Number,
    current: Number,
    turbidity: Number,
    datetime: Date,
  },
  {
    timeseries: {
      timeField: "datetime",
      metaField: "serialKey",
      granularity: "seconds",
    },
    autoCreate: false,
    expireAfterSeconds: 86400,
  }
);

module.exports = mongoose.model("Reading", readingSchema);
