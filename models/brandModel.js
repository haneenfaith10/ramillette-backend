const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      required: true,
    },
    brandImage: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Brand", BrandSchema);
