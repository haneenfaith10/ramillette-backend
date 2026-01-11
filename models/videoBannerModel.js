const mongoose = require("mongoose");

const videoBannerSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("VideoBanner", videoBannerSchema);
