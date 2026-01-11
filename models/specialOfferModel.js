const mongoose = require("mongoose");

const specialOfferSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: [
      "limited-time",
      "buy-one-get-one",
      "exclusive",
      "flash-sale",
      "bundle",
      "coupon-based",
      "category-based",
      "min-order-value",
    ],
    required: true,
  },
  discountType: {
    type: String,
    enum: ["percent", "flat"],
    required: true,
  },
  discountValue: { type: Number, required: true },
  validFrom: {
    type: String,
  },
  validTo: { type: String },
  isActive: { type: Boolean, default: true },

  // Relationships
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  categoryIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
  couponCode: String,
  minOrderValue: Number,
  bundleItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  isCommonOffer: {
    type: Boolean,
    default: false,
  },
  offerType: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("SpecialOffer", specialOfferSchema);
