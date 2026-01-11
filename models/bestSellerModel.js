const mongoose = require("mongoose");

const bestSellerSchema = new mongoose.Schema(
  {
    country: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
        required: true,
        index: true,
      },
    ],
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    video: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Home page query: best sellers by country
bestSellerSchema.index({ country: 1, status: 1 });

// Prevent duplicate best seller per product per country
bestSellerSchema.index({ product: 1, country: 1 }, { unique: true });

// Admin sorting
bestSellerSchema.index({ createdAt: -1 });

module.exports = mongoose.model("BestSeller", bestSellerSchema);
