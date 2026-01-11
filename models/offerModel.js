const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    badge: { type: String, required: true },
    description: String,

    // Type of the offer
    offerType: {
      type: String,
      enum: [
        "coupon",
        "discount",
        "category",
        "common",
        "new-customer",
        "bogo",
      ],
      required: true,
      index: true,
    },

    // Generic Discount Info
    discountType: {
      type: String,
      enum: ["percent", "flat"],
    },
    discountValue: Number,
    // maxDiscount: Number,
    minOrderValue: {
      type: Number,
      index: true,
    },
    maxOrderValue: Number,

    // Validity Period
    validFrom: {
      type: Date,
      index: true,
    },
    validTo: {
      type: Date,
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },

    // Coupon-based fields
    couponCode: String,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    usersUsed: [{ userId: mongoose.Schema.Types.ObjectId }],

    // Category based
    categoryIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true },
    ],

    // New user flag
    isForNewUsers: { type: Boolean, default: false },

    // Common offer flag
    isCommonOffer: { type: Boolean, default: false },
    productIds: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Product", index: true },
    ],
    buyProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    getProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    buyQuantity: {
      type: Number,
      default: 0,
    },

    getQuantity: {
      type: Number,
      default: 0,
    },

    sameProduct: {
      type: Boolean,
    },
    country: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Country",
        required: true,
        index: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Offer", OfferSchema);
