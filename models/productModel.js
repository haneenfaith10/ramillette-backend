const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "FAQ question is required"],
  },
  answer: {
    type: String,
    required: [true, "FAQ answer is required"],
  },
});

const countryPriceSchema = new mongoose.Schema({
  country: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Country",
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const variantSchema = new mongoose.Schema({
  variantName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  },
});

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      index: true,
    },
    productDescription: {
      type: String,
      required: true,
      index: true,
    },
    productShortName: {
      type: String,
      required: true,
      index: true,
    },
    // countryPrices: [countryPriceSchema],
    productDiscount: {
      type: Number,
      required: true,
      index: true,
    },
    productBenefits: {
      type: [String],
      required: true,
    },
    productRating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    productUseCase: {
      type: [String],
      required: true,
    },
    // productStock: {
    //   type: Number,
    //   required: true,
    // },
    productImages: {
      type: [
        {
          path: { type: String, required: true },
          orientation: {
            type: String,
            enum: ["portrait", "landscape"],
            required: true,
          },
        },
      ],
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
      index: true,
    },
    productIngredients: {
      type: String,
      required: true,
    },
    productOtherInfo: {
      type: String,
    },
    isDelete: {
      type: Boolean,
      default: false,
      index: true,
    },
    productFAQ: {
      type: [faqSchema],
    },

    productCategory: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Category",
        required: true,
        index: true,
      },
    ],
    countries: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Country",
        index: true,
      },
    ],
    featureBadges: [
      { type: mongoose.Types.ObjectId, ref: "Badge", index: true },
    ],
    specialOffers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Offer", index: true },
    ],
    countryVariants: {
      type: Map,
      of: [variantSchema],
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({
  status: 1,
  isDelete: 1,
  countries: 1,
  productCategory: 1,
});

//  Category page listing
productSchema.index({
  productCategory: 1,
  status: 1,
  isDelete: 1,
});

//  Country-specific products
productSchema.index({
  countries: 1,
  status: 1,
  isDelete: 1,
});

//  Admin listing & sorting
productSchema.index({ createdAt: -1 });

//  Rating based sorting
productSchema.index({ productRating: -1 });


module.exports = mongoose.model("Product", productSchema);
