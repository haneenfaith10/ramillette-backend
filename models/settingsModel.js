const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    companyLocation: {
      type: String,
      required: true,
    },
    companyEmail: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    companySupportEmail: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    tag: [
      {
        country: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Country",
          required: true,
        },
        value: {
          type: String,
        },
      },
    ],
    companyPhoneNumber: {
      type: Number,
      required: true,
    },
    companyAddress: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Settings", settingsSchema);
