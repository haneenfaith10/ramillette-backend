const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    iconUrl: {
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

badgeSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Badge", badgeSchema);
