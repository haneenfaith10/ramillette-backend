const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    phone: { type: Number },
    streetAddress: { type: String },
    city: { type: String },
    zip: { type: Number },
    state: { type: String },
    country: { type: String },
    isPrimary: { type: Boolean },
  },
  {
    timestamps: true,
    _id: true,
  }
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      //   required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
    },
    userImage: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
    cart: {
      items: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          qty: {
            type: Number,
            default: 0,
          },
          price: {
            type: Number,
            default: 0,
          },
          date: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      totalPrice: {
        type: Number,
        default: 0,
      },
    },
    address: [AddressSchema],
    wishlist: {
      products: [
        {
          product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
        },
      ],
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Performance indexes (email already has index from unique: true, so skip duplicate)
userSchema.index({ status: 1 }); // Filter active users
userSchema.index({ isBlocked: 1 }); // Filter blocked users
userSchema.index({ createdAt: -1 }); // Sort by creation date

module.exports = mongoose.model("user", userSchema);
