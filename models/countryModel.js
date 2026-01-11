const mongoose = require("mongoose");

const countrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    code: { type: String, required: true, unique: true, index: true },
    currency: { type: String, required: true, index: true },
    flagUrl: { type: String, required: true },
    priceLabel: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
    isPrimary: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Country", countrySchema);
