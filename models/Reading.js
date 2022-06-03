const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const readingSchema = Schema(
  {
    serialKey: String,
    rawX: [Number],
    rawY: [Number],
    rawZ: [Number],
    fftX: [Number],
    fftY: [Number],
    fftZ: [Number],
    rawDatetime: [Date],
    fftDatetime: [Date],
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
