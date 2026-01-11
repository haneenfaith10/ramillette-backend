const mongoose = require("mongoose");

const socialMediaSchema = new mongoose.Schema(
  {
    facebook: { type: String },
    instagram: { type: String },
    youtube: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SocialMedia", socialMediaSchema);
