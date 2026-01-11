const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: "",
    },
    countries: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Country",
        index: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Home page banners: find by country + active
bannerSchema.index({ countries: 1, isActive: 1 });

// Admin sorting & pagination
bannerSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Banner", bannerSchema);
