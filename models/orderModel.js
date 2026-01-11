const mongoose = require("mongoose");
const newUserOfferSchema = new mongoose.Schema(
  {
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
    },
    title: String,
    discountType: String, // percent | flat
    discountValue: Number,
    minOrderValue: Number,
    maxOrderValue: Number,
  },
  { _id: false }
);

const offerSchema = new mongoose.Schema(
  {
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Offer",
      index: true,
    },
    title: {
      type: String,
    },
    offerType: {
      type: String, // "discount" | "coupon" | "bogo" | "common"
    },
    discountType: {
      type: String, // "percent" | "flat"
    },
    discountValue: {
      type: Number,
      default: 0,
    },
    couponCode: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    _id: false,
  }
);

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true,
  },
  productPrice: {
    type: Number,
    required: true,
  },
  productDiscount: {
    type: Number,
    required: true,
  },
  finalPrice: {
    type: Number,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
  variantId: {
    type: String,
    required: true,
  },
  variantName: {
    type: String,
    required: true,
  },
  offer: offerSchema,
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true, index: true },
  zipCode: { type: Number, required: true },
});

const paymentResultSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    index: true, // payment reconciliation
  },
  status: String,
  updateTime: String,
  emailAddress: String,
});

const shippingMethodSchema = new mongoose.Schema(
  {
    courierPartner: {
      type: String,
      index: true,
    },
    estimatedDeliveryDate: {
      type: String,
    },
    name: {
      type: String,
    },
    trackingId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },
    orderItems: [orderItemSchema],
    deliveryAddress: shippingAddressSchema,
    paymentResult: paymentResultSchema,
    totalPrice: {
      type: Number,
      required: true,
      index: true,
    },
    subTotalPrice: {
      type: Number,
      required: true,
    },
    discountedPrice: {
      type: Number,
      required: false, // Only present if new-user offer applied
      default: null,
    },
    tax: {
      type: Number,
      require: true,
    },
    newUserOffer: {
      type: newUserOfferSchema,
      default: null,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    isPaid: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDelivered: {
      type: Boolean,
      default: false,
      index: true,
    },
    deliveredAt: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "Processing",
        "Packed",
        "Dispatched",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
        "Refund",
        "Delayed",
        "Refunded",
        "Refund processing",
        "Cancellation In Progress",
      ],
      default: "Processing",
      index: true,
    },
    deliverySteps: [
      {
        status: {
          type: String,
          enum: [
            "Order Placed",
            "Processing",
            "Packed",
            "Dispatched",
            "Shipped",
            "Out for Delivery",
            "Delivered",
            "Cancellation In Progress",
          ],
        },
        message: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    paymentMethod: {
      type: String,
      required: true,
    },
    shippingMethod: shippingMethodSchema,
    currency: {
      type: String,
      required: true,
    },
    cancellationReason: {
      type: String,
    },
    isCancelledByAdmin: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);
OrderSchema.index({ user: 1, createdAt: -1 });

//  Admin order management
OrderSchema.index({ status: 1, createdAt: -1 });

//  Payment reconciliation
OrderSchema.index({ isPaid: 1, createdAt: -1 });

//  Delivery tracking
OrderSchema.index({ isDelivered: 1, status: 1 });


//  Country-wise reporting
OrderSchema.index({ "deliveryAddress.country": 1, createdAt: -1 });

//  Revenue dashboards
OrderSchema.index({ currency: 1, createdAt: -1 });

//  Global admin sorting
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", OrderSchema);
