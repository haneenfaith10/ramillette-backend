const mongoose = require("mongoose");

const shippingProviderSchema = new mongoose.Schema(
  {
    providerName: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = new mongoose.model("ShippingProvider", shippingProviderSchema);
