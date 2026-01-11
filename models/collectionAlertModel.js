const mongoose = require("mongoose");

const collectionAlertSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
      index: true,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Most common query: active alert per country
collectionAlertSchema.index({ country: 1, status: 1 });

// Admin sorting & pagination
collectionAlertSchema.index({ createdAt: -1 });

module.exports = mongoose.model("CollectionAlerts", collectionAlertSchema);
