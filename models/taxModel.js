const mongoose = require("mongoose");

const taxSchema = new mongoose.Schema(
  {
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
      unique: true,
    },
    taxPercentage: {
      type: Number,
      required: true,
      min: 0,
    },
    taxName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tax", taxSchema);
