const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      required: true,
      index: true,
    },
    categoryImage: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Most common query: active & not deleted categories
categorySchema.index({ status: 1, isDeleted: 1 });

// Admin sorting / pagination
categorySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Category", categorySchema);
