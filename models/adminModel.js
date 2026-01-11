const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Admin listing / audit logs
adminSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Admin", adminSchema);
