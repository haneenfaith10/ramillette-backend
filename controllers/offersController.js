const SpecialOffer = require("../models/specialOfferModel");
const Product = require("../models/productModel");
const Offers = require("../models/offerModel");
const mongoose = require("mongoose");

const allowedTypes = [
  "limited-time",
  "buy-one-get-one",
  "exclusive",
  "flash-sale",
  "bundle",
  "coupon-based",
  "category-based",
  "min-order-value",
];

const allowedDiscountTypes = ["percent", "flat"];

module.exports = {
  createOffer: async (req, res) => {
    try {
      const {
        title,
        type,
        discountType,
        discountValue,
        validFrom,
        validTo,
        isCommonOffer,
      } = req.body;

      console.log(req.body, "bodddyy");

      // if (!title || typeof title !== "string" || title.trim().length === 0) {
      //   return res
      //     .status(400)
      //     .json({ isSuccess: false, message: "Title is required" });
      // }

      // if (!allowedTypes.includes(type)) {
      //   return res
      //     .status(400)
      //     .json({ isSuccess: false, message: "Invalid offer type" });
      // }

      // if (!allowedDiscountTypes.includes(discountType)) {
      //   return res
      //     .status(400)
      //     .json({ isSuccess: false, message: "Invalid discount type" });
      // }

      // if (typeof discountValue !== "number" || discountValue <= 0) {
      //   return res.status(400).json({
      //     isSuccess: false,
      //     message: "Discount value must be a positive number",
      //   });
      // }

      // if (validFrom && isNaN(Date.parse(validFrom))) {
      //   return res.status(400).json({
      //     isSuccess: false,
      //     message: "Valid From is not a valid date",
      //   });
      // }

      // if (validTo && isNaN(Date.parse(validTo))) {
      //   return res
      //     .status(400)
      //     .json({ isSuccess: false, message: "Valid To is not a valid date" });
      // }

      // const offer = new SpecialOffer({
      //   title,
      //   type,
      //   discountType,
      //   discountValue,
      //   validFrom,
      //   validTo,
      //   isCommonOffer,
      // });

      // const savedOffer = await offer.save();

      // if (isCommonOffer) {
      //   await Product.updateMany(
      //     { isDelete: false },
      //     { $addToSet: { specialOffers: savedOffer._id } }
      //   );
      // }

      // res.status(200).json({
      //   isSuccess: true,
      //   message: "Offer created successfully",
      //   offer: savedOffer,
      // });
    } catch (error) {
      console.error("Error while creating special offer:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  //   function to delete the offer
  deleteOffer: async (req, res) => {
    try {
      const { offerId } = req.params;

      if (!offerId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Offer ID is required",
        });
      }
      await Product.updateMany(
        { specialOffers: offerId },
        { $pull: { specialOffers: offerId } }
      );

      const deleted = await SpecialOffer.findByIdAndDelete(offerId);

      if (!deleted) {
        return res.status(404).json({
          isSuccess: false,
          message: "Offer not found",
        });
      }

      return res.status(200).json({
        isSuccess: true,
        message: "Offer deleted successfully",
        offer: deleted,
      });
    } catch (error) {
      console.error("Error deleting offer:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to fetch the common offers for admin
  fetchCommonOffer: async (req, res) => {
    try {
      const offers = await SpecialOffer.find({ isCommonOffer: true });
      res.status(200).json({
        message: "Common offers fetched successfully",
        isSuccess: true,
        offers,
      });
    } catch (error) {
      console.error("Error while fetching common offers for admin!!:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to edit the existing offer
  editOffer: async (req, res) => {
    try {
      const { offerId } = req.params;
      const {
        title,
        type,
        discountType,
        discountValue,
        validFrom,
        validTo,
        isCommonOffer,
      } = req.body;

      // Validate required fields
      if (!offerId) {
        return res
          .status(400)
          .json({ isSuccess: false, message: "Offer ID is required" });
      }

      const existingOffer = await SpecialOffer.findById(offerId);
      if (!existingOffer) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "Offer not found" });
      }

      // Input validation
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        return res
          .status(400)
          .json({ isSuccess: false, message: "Title is required" });
      }

      if (!allowedTypes.includes(type)) {
        return res
          .status(400)
          .json({ isSuccess: false, message: "Invalid offer type" });
      }

      if (!allowedDiscountTypes.includes(discountType)) {
        return res
          .status(400)
          .json({ isSuccess: false, message: "Invalid discount type" });
      }

      if (typeof discountValue !== "number" || discountValue <= 0) {
        return res.status(400).json({
          isSuccess: false,
          message: "Discount value must be a positive number",
        });
      }

      if (validFrom && isNaN(Date.parse(validFrom))) {
        return res.status(400).json({
          isSuccess: false,
          message: "Valid From is not a valid date",
        });
      }

      if (validTo && isNaN(Date.parse(validTo))) {
        return res.status(400).json({
          isSuccess: false,
          message: "Valid To is not a valid date",
        });
      }

      // Update the offer
      const updatedOffer = await SpecialOffer.findByIdAndUpdate(
        offerId,
        {
          title,
          type,
          discountType,
          discountValue,
          validFrom,
          validTo,
          isCommonOffer,
        },
        { new: true }
      );

      return res.status(200).json({
        isSuccess: true,
        message: "Offer updated successfully",
        offer: updatedOffer,
      });
    } catch (error) {
      console.error("Error while updating special offer:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // to create discount offers by admin
  createDiscountOffer: async (req, res) => {
    try {
      const {
        title,
        badge,
        minOrderValue,
        maxPurchase,
        discountValue,
        discountType,
        offerType,
        validFrom,
        validTo,
        description,
        selectedCountries,
        selectedProducts,
      } = req.body;

      if (
        !title ||
        !badge ||
        !minOrderValue ||
        !maxPurchase ||
        !discountValue ||
        !discountType ||
        !offerType ||
        !validFrom ||
        !selectedProducts
      ) {
        return res.status(400).json({
          isSuccess: false,
          message: "Missing required fields",
        });
      }
      const newOffer = new Offers({
        title,
        description,
        badge,
        offerType,
        discountType,
        discountValue,
        validFrom,
        validTo,
        minOrderValue,
        maxOrderValue: maxPurchase,
        productIds: selectedProducts,
        country: Array.isArray(selectedCountries)
          ? selectedCountries.map((c) => c.value)
          : [],
      });
      const savedOffer = await newOffer.save();
      await Product.updateMany(
        { _id: { $in: selectedProducts } },
        { $push: { specialOffers: savedOffer._id } }
      );

      return res.status(200).json({
        isSuccess: true,
        message: "Discount offer created and linked to products",
        offer: savedOffer,
      });
    } catch (error) {
      console.error("Error while creating the discount offer:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to create category offers
  createCategoryOffer: async (req, res) => {
    try {
      const {
        title,
        badge,
        minOrderValue,
        maxPurchase,
        discountValue,
        discountType,
        offerType,
        validFrom,
        validTo,
        description,
        selectedCategories,
      } = req.body;

      if (
        !title ||
        !badge ||
        !minOrderValue ||
        !maxPurchase ||
        !discountValue ||
        !discountType ||
        !offerType ||
        !validFrom ||
        !selectedCategories ||
        !Array.isArray(selectedCategories) ||
        selectedCategories.length === 0
      ) {
        return res.status(400).json({
          isSuccess: false,
          message: "Missing or invalid required fields",
        });
      }

      const newOffer = new Offers({
        title,
        badge,
        description,
        offerType,
        discountType,
        discountValue,
        validFrom,
        validTo,
        minOrderValue,
        maxOrderValue: maxPurchase,
        categoryIds: selectedCategories,
      });

      const updatedProducts = await Product.updateMany(
        {
          productCategory: { $in: selectedCategories },
          status: true,
          isDelete: false,
        },
        {
          $push: { specialOffers: newOffer._id },
        }
      );
      // 2. Find affected products to get their IDs
      const matchedProducts = await Product.find(
        { productCategory: { $in: selectedCategories } },
        { _id: 1 }
      );

      // 3. Extract the product IDs
      const productIds = matchedProducts.map((p) => p._id);

      newOffer.productIds = productIds;

      const savedOffer = await newOffer.save();

      return res.status(200).json({
        isSuccess: true,
        message: "Category-based offer created successfully",
        offer: savedOffer,
      });
    } catch (error) {
      console.error("Error while creating the category offer:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // to create coupon offers
  createCouponOffer: async (req, res) => {
    try {
      const {
        title,
        badge,
        minOrderValue,
        maxPurchase,
        discountValue,
        discountType,
        offerType,
        validFrom,
        validTo,
        description,
        couponCode,
        couponCount,
        selectedCountries,
        selectedProducts,
      } = req.body;

      if (
        !title ||
        !badge ||
        !minOrderValue ||
        !maxPurchase ||
        !discountValue ||
        !discountType ||
        !offerType ||
        !validFrom ||
        !validTo ||
        !couponCode ||
        !couponCount
      ) {
        return res.status(400).json({
          isSuccess: false,
          message: "Missing required fields",
        });
      }
      const newOffer = new Offers({
        title,
        description,
        badge,
        offerType,
        discountType,
        discountValue,
        validFrom,
        validTo,
        minOrderValue,
        maxOrderValue: maxPurchase,
        couponCode: couponCode.trim().toUpperCase(),
        usageLimit: couponCount,
        isActive: true,
        productIds: selectedProducts,
        country: Array.isArray(selectedCountries)
          ? selectedCountries.map((c) => c.value)
          : [],
      });

      const savedOffer = await newOffer.save();
      if (Array.isArray(selectedProducts) && selectedProducts.length > 0) {
        await Product.updateMany(
          { _id: { $in: selectedProducts } },
          { $push: { specialOffers: savedOffer._id } }
        );
      }
      return res.status(200).json({
        isSuccess: true,
        message: "Coupon offer created successfully",
        offer: savedOffer,
      });
    } catch (error) {
      console.error("Error while creating the coupon offer:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },

  // function to create new customer offer
  createNewCustomerOffer: async (req, res) => {
    try {
      const {
        title,
        badge,
        minOrderValue,
        maxPurchase,
        discountValue,
        discountType,
        offerType,
        validFrom,
        validTo,
        description,
      } = req.body;

      if (
        !title ||
        !badge ||
        !minOrderValue ||
        !maxPurchase ||
        !discountValue ||
        !discountType ||
        !validFrom ||
        !validTo
      ) {
        return res.status(400).json({
          isSuccess: false,
          message: "Missing required fields",
        });
      }
      const newOffer = new Offers({
        title,
        badge,
        minOrderValue,
        maxOrderValue: maxPurchase,
        discountValue,
        discountType,
        validFrom,
        validTo,
        description,
        offerType,
      });

      const savedOffer = await newOffer.save();

      return res.status(200).json({
        isSuccess: true,
        message: "New customer offer created successfully",
        offer: savedOffer,
      });
    } catch (error) {
      console.error("Error while creating the new customer offer:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },

  // function to create bogo offers
  createBoGoOffer: async (req, res) => {
    try {
      const {
        title,
        badge,
        description,
        getProductId,
        buyQuantity,
        getQuantity,
        sameProduct,
        validFrom,
        validTo,
        offerType,
        buyProductId,
        discount,
      } = req.body;

      console.log(req.body, "req.body");

      if (!title || !badge || !buyProductId || !buyQuantity) {
        return res.status(400).json({
          isSuccess: false,
          message: "Missing required BOGO offer fields.",
        });
      }

      const newOffer = new Offers({
        title,
        badge,
        description,
        offerType: offerType || "bogo",
        buyProductId,
        buyQuantity,
        getQuantity,
        validFrom,
        validTo,
        isActive: true,
        discountValue: discount,
      });
      await newOffer.save();

      await Product.findByIdAndUpdate(buyProductId, {
        $push: { specialOffers: newOffer._id },
      });

      return res.status(200).json({
        isSuccess: true,
        message: "BOGO offer created successfully.",
        offer: newOffer,
      });
    } catch (error) {
      console.error("Error while creating the Bogo offer:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // createBoGoOffer: async (req, res) => {
  //   try {
  //     const {
  //       title,
  //       badge,
  //       description,
  //       getProductId,
  //       buyQuantity,
  //       getQuantity,
  //       sameProduct,
  //       validFrom,
  //       validTo,
  //       offerType,
  //       buyProductId,
  //     } = req.body;

  //     console.log(req.body,"req.body")

  //     if (!title || !badge || !buyProductId || !buyQuantity || !getQuantity) {
  //       return res.status(400).json({
  //         isSuccess: false,
  //         message: "Missing required BOGO offer fields.",
  //       });
  //     }

  //     const finalGetProductId = sameProduct ? buyProductId : getProductId;

  //     const newOffer = new Offers({
  //       title,
  //       badge,
  //       description,
  //       offerType: offerType || "bogo",
  //       buyProductId,
  //       getProductId: finalGetProductId,
  //       buyQuantity,
  //       getQuantity,
  //       sameProduct,
  //       validFrom,
  //       validTo,
  //       isActive: true,
  //     });
  //     await newOffer.save();

  //     await Product.findByIdAndUpdate(buyProductId, {
  //       $push: { specialOffers: newOffer._id },
  //     });

  //     return res.status(200).json({
  //       isSuccess: true,
  //       message: "BOGO offer created successfully.",
  //       offer: newOffer,
  //     });
  //   } catch (error) {
  //     console.error("Error while creating the Bogo offer:", error);
  //     return res.status(500).json({
  //       isSuccess: false,
  //       message: "Internal server error",
  //     });
  //   }
  // },
  // function to get the discount offers
  getDiscountOffers: async (req, res) => {
    try {
      const { offertype } = req.headers;
      const offers = await Offers.find({ offerType: offertype })
        .sort({
          createdAt: -1,
        })
        .populate("country");

      res.status(200).json({
        isSuccess: true,
        message: "Discount offer fetched successfully",
        offers,
      });
    } catch (error) {
      console.error("Error while getting discount offer:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // to delete the discount offer
  deleteDiscountOffer: async (req, res) => {
    try {
      const { offerId } = req.params;
      if (!offerId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Offer ID is required.",
        });
      }
      const deletedOffer = await Offers.findByIdAndDelete(offerId);

      if (!deletedOffer) {
        return res.status(404).json({
          isSuccess: false,
          message: "Discount offer not found.",
        });
      }

      await Product.updateMany(
        { specialOffers: offerId },
        { $pull: { specialOffers: offerId } }
      );
      await deletedOffer.deleteOne();
      return res.status(200).json({
        isSuccess: true,
        message: "Discount offer deleted successfully.",
        deletedOffer,
      });
    } catch (error) {
      console.error("Error while deleting discount offer:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to toggle the status of the discount offer
  toggleChangeDiscountOffer: async (req, res) => {
    try {
      const { offerId } = req.params;

      if (!offerId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Offer ID is required.",
        });
      }

      const offer = await Offers.findById(offerId);

      if (!offer) {
        return res.status(404).json({
          isSuccess: false,
          message: "Discount offer not found.",
        });
      }

      offer.isActive = !offer.isActive;
      await offer.save();

      return res.status(200).json({
        isSuccess: true,
        message: `Offer status updated to ${
          offer.isActive ? "Active" : "Inactive"
        }.`,
        data: offer,
      });
    } catch (error) {
      console.error("Error while toggling status of discount offer:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to edit the discount offer data
  editDiscountOffer: async (req, res) => {
    try {
      const { offerId } = req.params;
      const {
        title,
        badge,
        minOrderValue,
        maxPurchase, // from frontend, actually maps to maxOrderValue
        discountValue,
        discountType,
        offerType,
        validFrom,
        validTo,
        description,
        selectedProducts = [],
        selectedCountries,
      } = req.body;

      if (!offerId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Offer ID is required",
        });
      }
      const updatedFields = {
        title,
        badge,
        minOrderValue,
        maxOrderValue: maxPurchase,
        discountValue,
        discountType,
        offerType,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        description,
        productIds: selectedProducts,
        updatedAt: new Date(),
        country: Array.isArray(selectedCountries)
          ? selectedCountries.map((c) => c.value)
          : [],
      };

      const updatedOffer = await Offers.findByIdAndUpdate(
        offerId,
        updatedFields,
        { new: true }
      );

      if (!updatedOffer) {
        return res.status(404).json({
          isSuccess: false,
          message: "Discount offer not found",
        });
      }

      return res.status(200).json({
        isSuccess: true,
        message: "Discount offer updated successfully",
        data: updatedOffer,
      });
    } catch (error) {
      console.error("Error while editing discount offer data", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // to get all bogo offers
  getAllBogoOffers: async (req, res) => {
    try {
      const { offertype } = req.headers;

      const offers = await Offers.find({ offerType: offertype })
        .sort({
          createdAt: -1,
        })
        .populate("getProductId buyProductId");

      res.status(200).json({
        isSuccess: true,
        message: "Discount offer fetched successfully",
        offers,
      });
    } catch (error) {
      console.error("Error while getting bogo offer", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to delete the bogo offer
  deleteBogoOffer: async (req, res) => {
    try {
      const { offerId } = req.params;
      if (!offerId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Offer ID is required",
        });
      }
      const deletedOffer = await Offers.findByIdAndDelete(offerId);
      if (!deletedOffer) {
        return res.status(404).json({
          isSuccess: false,
          message: "Offer not found",
        });
      }

      await Product.updateMany(
        { specialOffers: offerId },
        { $pull: { specialOffers: offerId } }
      );

      return res.status(200).json({
        isSuccess: true,
        message: "Bogo offer deleted successfully",
      });
    } catch (error) {
      console.error("Error while getting bogo offer", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to toggle the status of the bogo offer
  toggleBogoOffer: async (req, res) => {
    try {
      const { offerId } = req.params;
      if (!offerId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Offer ID is required",
        });
      }

      const offer = await Offers.findById(offerId);

      if (!offer) {
        return res.status(404).json({
          isSuccess: false,
          message: "BOGO offer not found",
        });
      }

      // Toggle the status
      offer.isActive = !offer.isActive;
      await offer.save();

      return res.status(200).json({
        isSuccess: true,
        message: `BOGO offer status updated to ${
          offer.isActive ? "Active" : "Inactive"
        }`,
        data: offer,
      });
    } catch (error) {
      console.error("Error while toggling bogo offer", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to update the bogo offer
  // updateBogoOffer: async (req, res) => {
  //   try {
  //     const { offerId } = req.params;
  //     const {
  //       title,
  //       badge,
  //       description,
  //       buyProductId,
  //       getProductId,
  //       buyQuantity,
  //       getQuantity,
  //       sameProduct,
  //       validFrom,
  //       validTo,
  //       offerType,
  //       discount
  //     } = req.body;

  //     if (!mongoose.Types.ObjectId.isValid(offerId)) {
  //       return res.status(400).json({
  //         isSuccess: false,
  //         message: "Invalid offer ID",
  //       });
  //     }

  //     const existingOffer = await Offers.findById(offerId);

  //     if (!existingOffer) {
  //       return res.status(404).json({
  //         isSuccess: false,
  //         message: "Offer not found",
  //       });
  //     }
  //     // Update only fields relevant to BOGO
  //     existingOffer.title = title;
  //     existingOffer.badge = badge;
  //     existingOffer.description = description;
  //     existingOffer.buyProductId = buyProductId;
  //     existingOffer.getProductId = getProductId;
  //     existingOffer.buyQuantity = buyQuantity;
  //     existingOffer.getQuantity = getQuantity;
  //     existingOffer.sameProduct = sameProduct;
  //     existingOffer.validFrom = new Date(validFrom);
  //     existingOffer.validTo = new Date(validTo);
  //     existingOffer.offerType = offerType;

  //     await existingOffer.save();

  //     return res.status(200).json({
  //       isSuccess: true,
  //       message: "BOGO offer updated successfully",
  //       offer: existingOffer,
  //     });
  //   } catch (error) {
  //     console.error("Error while updating bogo offer", error);
  //     return res.status(500).json({
  //       isSuccess: false,
  //       message: "Internal server error",
  //     });
  //   }
  // },
  updateBogoOffer: async (req, res) => {
    try {
      const { offerId } = req.params;
      const {
        title,
        badge,
        description,
        buyProductId,
        getProductId,
        buyQuantity,
        getQuantity,
        sameProduct,
        validFrom,
        validTo,
        offerType,
        discount,
      } = req.body;

      if (!mongoose.Types.ObjectId.isValid(offerId)) {
        return res.status(400).json({
          isSuccess: false,
          message: "Invalid offer ID",
        });
      }

      const existingOffer = await Offers.findById(offerId);

      if (!existingOffer) {
        return res.status(404).json({
          isSuccess: false,
          message: "Offer not found",
        });
      }
      // Update only fields relevant to BOGO
      existingOffer.title = title;
      existingOffer.badge = badge;
      existingOffer.description = description;
      existingOffer.buyProductId = buyProductId;
      existingOffer.buyQuantity = buyQuantity;
      existingOffer.validFrom = new Date(validFrom);
      existingOffer.validTo = new Date(validTo);
      existingOffer.offerType = offerType;
      existingOffer.discountValue = discount;

      await existingOffer.save();

      return res.status(200).json({
        isSuccess: true,
        message: "BOGO offer updated successfully",
        offer: existingOffer,
      });
    } catch (error) {
      console.error("Error while updating bogo offer", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to get the list of the category list
  getCategoryOffers: async (req, res) => {
    try {
      const { offertype } = req.headers;

      const offers = await Offers.find({ offerType: offertype }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        isSuccess: true,
        message: "Category offer fetched successfully",
        offers,
      });
    } catch (error) {
      console.error("Error while getting category offer", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to toggle the category  offer
  toggleCategoryOffer: async (req, res) => {
    try {
      const { offerId } = req.params;
      if (!offerId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Offer ID is required",
        });
      }

      const offer = await Offers.findById(offerId);

      if (!offer) {
        return res.status(404).json({
          isSuccess: false,
          message: "Category offer not found",
        });
      }

      // Toggle the status
      offer.isActive = !offer.isActive;
      await offer.save();

      return res.status(200).json({
        isSuccess: true,
        message: `Category offer status updated to ${
          offer.isActive ? "Active" : "Inactive"
        }`,
        data: offer,
      });
    } catch (error) {
      console.error("Error while toggling category offer", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },

  updateCategoryOffer: async (req, res) => {
    try {
      const { offerId } = req.params;

      const {
        title,
        badge,
        minOrderValue,
        maxPurchase,
        discountType,
        discountValue,
        validFrom,
        validTo,
        offerType,
        description,
        selectedCategories,
      } = req.body;

      if (!mongoose.Types.ObjectId.isValid(offerId)) {
        return res.status(400).json({
          isSuccess: false,
          message: "Invalid offer ID",
        });
      }

      const existingOffer = await Offers.findById(offerId);

      if (!existingOffer) {
        return res.status(404).json({
          isSuccess: false,
          message: "Offer not found",
        });
      }

      // UPDATE OFFER FIELDS
      existingOffer.title = title;
      existingOffer.badge = badge;
      existingOffer.minOrderValue = minOrderValue;
      existingOffer.maxOrderValue = maxPurchase;
      existingOffer.discountValue = discountValue;
      existingOffer.discountType = discountType;
      existingOffer.validFrom = new Date(validFrom);
      existingOffer.validTo = new Date(validTo);
      existingOffer.description = description;
      existingOffer.offerType = offerType;
      existingOffer.categoryIds = selectedCategories;

      await existingOffer.save();

      // FETCH ALL PRODUCTS IN SELECTED CATEGORIES
      const productsInSelectedCategories = await Product.find({
        productCategory: { $in: selectedCategories },
      });

      const productIdsInSelected = productsInSelectedCategories.map((p) =>
        p._id.toString()
      );

      // ADD OFFER TO PRODUCTS THAT DON'T HAVE IT
      await Product.updateMany(
        {
          productCategory: { $in: selectedCategories },
          specialOffers: { $ne: offerId }, // Not already added
        },
        {
          $addToSet: { specialOffers: offerId },
        }
      );

      //  REMOVE OFFER FROM PRODUCTS THAT NO LONGER BELONG TO THE CATEGORIES
      await Product.updateMany(
        {
          specialOffers: offerId,
          _id: { $nin: productIdsInSelected },
        },
        { $pull: { specialOffers: offerId } }
      );

      return res.status(200).json({
        isSuccess: true,
        message:
          "Category offer updated successfully and reapplied to products.",
      });
    } catch (error) {
      console.error("Error while updating category offer", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },

  // function to delete the category offer
  deleteCategoryOffer: async (req, res) => {
    try {
      const { offerId } = req.params;
      if (!offerId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Offer ID is required",
        });
      }
      const deletedOffer = await Offers.findByIdAndDelete(offerId);
      if (!deletedOffer) {
        return res.status(404).json({
          isSuccess: false,
          message: "Offer not found",
        });
      }

      await Product.updateMany(
        { specialOffers: offerId },
        { $pull: { specialOffers: offerId } }
      );

      return res.status(200).json({
        isSuccess: true,
        message: "Bogo offer deleted successfully",
      });
    } catch (error) {
      console.error("Error while getting bogo offer", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to get the coupon offer
  getCouponOffers: async (req, res) => {
    try {
      const { offertype } = req.headers;

      const offers = await Offers.find({ offerType: offertype })
        .sort({
          createdAt: -1,
        })
        .populate("country");

      res.status(200).json({
        isSuccess: true,
        message: "Coupon offer fetched successfully",
        offers,
      });
    } catch (error) {
      console.error("Error while getting coupon offer", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to toggle the coupon offer
  toggleCouponOffer: async (req, res) => {
    try {
      const { offerId } = req.params;
      if (!offerId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Offer ID is required",
        });
      }

      const offer = await Offers.findById(offerId);

      if (!offer) {
        return res.status(404).json({
          isSuccess: false,
          message: "Coupon offer not found",
        });
      }

      // Toggle the status
      offer.isActive = !offer.isActive;
      await offer.save();

      return res.status(200).json({
        isSuccess: true,
        message: `Coupon offer status updated to ${
          offer.isActive ? "Active" : "Inactive"
        }`,
        data: offer,
      });
    } catch (error) {
      console.error("Error while toggling coupon offer", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to update the coupon offer
  updateCouponOffer: async (req, res) => {
    try {
      const { offerId } = req.params;
      const {
        title,
        badge,
        minOrderValue,
        maxPurchase,
        discountValue,
        discountType,
        offerType,
        validFrom,
        validTo,
        description,
        couponCode,
        couponCount,
        selectedProducts = [],
        selectedCountries,
      } = req.body;

      if (!offerId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Offer ID is required",
        });
      }

      // Validate required fields
      if (
        !title ||
        !badge ||
        !minOrderValue ||
        !maxPurchase ||
        !discountValue ||
        !discountType ||
        !offerType ||
        !validFrom ||
        !validTo ||
        !couponCode ||
        !couponCount
      ) {
        return res.status(400).json({
          isSuccess: false,
          message: "Missing required fields",
        });
      }

      const updatedFields = {
        title,
        badge,
        minOrderValue,
        maxOrderValue: maxPurchase,
        discountValue,
        discountType,
        offerType,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        description,
        couponCode: couponCode.trim().toUpperCase(),
        usageLimit: couponCount,
        productIds: selectedProducts,
        updatedAt: new Date(),
        country: Array.isArray(selectedCountries)
          ? selectedCountries.map((c) => c.value)
          : [],
      };

      // Fetch the existing offer before updating
      const existingOffer = await Offers.findById(offerId);
      if (!existingOffer) {
        return res.status(404).json({
          isSuccess: false,
          message: "Coupon offer not found",
        });
      }

      const oldProductIds = existingOffer.productIds.map((id) => id.toString());
      const newProductIds = selectedProducts.map((id) => id.toString());

      // Products to remove the offer from
      const productsToRemove = oldProductIds.filter(
        (id) => !newProductIds.includes(id)
      );
      // Products to add the offer to
      const productsToAdd = newProductIds.filter(
        (id) => !oldProductIds.includes(id)
      );

      // Remove offer from products no longer selected
      if (productsToRemove.length > 0) {
        await Product.updateMany(
          { _id: { $in: productsToRemove } },
          { $pull: { specialOffers: offerId } }
        );
      }

      // Add offer to newly selected products
      if (productsToAdd.length > 0) {
        await Product.updateMany(
          { _id: { $in: productsToAdd } },
          { $addToSet: { specialOffers: offerId } }
        );
      }

      const updatedOffer = await Offers.findByIdAndUpdate(
        offerId,
        updatedFields,
        { new: true }
      );

      if (!updatedOffer) {
        return res.status(404).json({
          isSuccess: false,
          message: "Coupon offer not found",
        });
      }
      return res.status(200).json({
        isSuccess: true,
        message: "Coupon offer updated successfully",
        data: updatedOffer,
      });
    } catch (error) {
      console.error("Error while updating coupon offer", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to delete the coupon offer
  deleteCouponOffer: async (req, res) => {
    try {
      const { offerId } = req.params;
      if (!offerId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Offer ID is required",
        });
      }
      const deletedOffer = await Offers.findByIdAndDelete(offerId);
      if (!deletedOffer) {
        return res.status(404).json({
          isSuccess: false,
          message: "Offer not found",
        });
      }
      await Product.updateMany(
        { specialOffers: offerId },
        { $pull: { specialOffers: offerId } }
      );
      return res.status(200).json({
        isSuccess: true,
        message: "Coupon offer deleted successfully",
      });
    } catch (error) {
      console.error("Error while deleting coupon offer", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to get the new customer offer
  getAllNewCustomerOffers: async (req, res) => {
    try {
      const { offertype } = req.headers;

      const offers = await Offers.find({ offerType: offertype }).sort({
        createdAt: -1,
      });

      res.status(200).json({
        isSuccess: true,
        message: "New customer offer fetched successfully",
        offers,
      });
    } catch (error) {
      console.error("Error while getting new customer offer", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to toggle the coupon offer
  toggleNewCustomerOffer: async (req, res) => {
    try {
      const { offerId } = req.params;
      if (!offerId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Offer ID is required",
        });
      }

      const offer = await Offers.findById(offerId);

      if (!offer) {
        return res.status(404).json({
          isSuccess: false,
          message: "New customer offer not found",
        });
      }

      // Toggle the status
      offer.isActive = !offer.isActive;
      await offer.save();

      return res.status(200).json({
        isSuccess: true,
        message: `New customer offer status updated to ${
          offer.isActive ? "Active" : "Inactive"
        }`,
        data: offer,
      });
    } catch (error) {
      console.error("Error while toggling new c ustomer offer", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  updateNewCustomerOffer: async (req, res) => {
    try {
      const { offerId } = req.params;
      const {
        title,
        badge,
        minOrderValue,
        maxPurchase,
        discountValue,
        discountType,
        offerType,
        validFrom,
        validTo,
        description,
        selectedCountries,
      } = req.body;

      if (!offerId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Offer ID is required",
        });
      }
      const updatedFields = {
        title,
        badge,
        minOrderValue,
        maxOrderValue: maxPurchase,
        discountValue,
        discountType,
        offerType,
        validFrom: new Date(validFrom),
        validTo: new Date(validTo),
        description,
        updatedAt: new Date(),
        country: selectedCountries,
      };

      console.log(updatedFields, "updatedFields");

      const updatedOffer = await Offers.findByIdAndUpdate(
        offerId,
        updatedFields,
        { new: true }
      );
      if (!updatedOffer) {
        return res.status(404).json({
          isSuccess: false,
          message: "New customer offer not found",
        });
      }
      return res.status(200).json({
        isSuccess: true,
        message: "New customer offer updated successfully",
        data: updatedOffer,
      });
    } catch (error) {
      console.error("Error while updating new customer offer", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to delte the new customer offer
  deleteNewCustomerOffer: async (req, res) => {
    try {
      const { offerId } = req.params;
      if (!offerId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Offer ID is required",
        });
      }
      const deletedOffer = await Offers.findByIdAndDelete(offerId);
      if (!deletedOffer) {
        return res.status(404).json({
          isSuccess: false,
          message: "Offer not found",
        });
      }
      return res.status(200).json({
        isSuccess: true,
        message: "New customer offer deleted successfully",
      });
    } catch (error) {
      console.error("Error while deleting new customer offer", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to get the offers for the product in checkout page
  getCheckoutProductOffers: async (req, res) => {
    try {
      const { productIds, countryId } = req.body;

      if (!productIds?.length || !countryId) {
        return res.status(400).json({ message: "Invalid input data" });
      }

      // Fetch products with their offers populated
      const products = await Product.find({ _id: { $in: productIds } })
        .populate("specialOffers")
        .populate("productCategory");

      const now = new Date();
      const response = [];

      for (const product of products) {
        const activeOffers = product.specialOffers.filter(
          (offer) =>
            offer.isActive &&
            (!offer.validFrom || now >= new Date(offer.validFrom)) &&
            (!offer.validTo || now <= new Date(offer.validTo))
        );

        if (activeOffers.length === 0) continue;

        // Use variant price based on selected country
        const variants = product.countryVariants.get(countryId) || [];
        const variantPrice = variants.length ? variants[0].price : 0;

        const applicableOffers = [];

        for (const offer of activeOffers) {
          const result = applyOfferToProduct(product, offer, variantPrice, 1);

          if (result) {
            applicableOffers.push({
              offerId: offer._id,
              offerType: offer.offerType,
              title: offer.title,
              description: offer.description,
              discountType: offer.discountType,
              discountValue: offer.discountValue,
              minOrderValue: offer.minOrderValue || 0, // ✅ Added here
              maxOrderValue: offer.maxOrderValue || null,
              discountedPrice: result.discountedPrice,
              discountAmount: result.discountAmount || 0,
              freeProductId: result.freeProductId || null,
              freeQuantity: result.freeQuantity || 0,
              validFrom: offer.validFrom,
              validTo: offer.validTo,
            });
          }
        }

        // ✅ Sort offers by minOrderValue (smallest first)
        applicableOffers.sort(
          (a, b) => (a.minOrderValue || 0) - (b.minOrderValue || 0)
        );

        if (applicableOffers.length > 0) {
          response.push({
            productId: product._id,
            productName: product.name,
            basePrice: variantPrice,
            offers: applicableOffers,
          });
        }
      }

      return res.status(200).json({
        isSuccess: true,
        offers: response,
      });
    } catch (error) {
      console.error("Error fetching checkout offers:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  verifyCouponCode: async (req, res) => {
    try {
      const { productId, couponCode, countryId } = req.body;

      if (!productId || !couponCode || !countryId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Missing required fields",
        });
      }

      // Find the product and its active offers
      const product = await Product.findById(productId).populate(
        "specialOffers"
      );

      if (!product) {
        return res.status(404).json({
          isSuccess: false,
          message: "Product not found",
        });
      }

      const now = new Date();
      const activeCoupon = product.specialOffers.find(
        (offer) =>
          offer.offerType === "coupon" &&
          offer.isActive &&
          offer.couponCode?.toUpperCase() === couponCode.toUpperCase() &&
          (!offer.validFrom || now >= new Date(offer.validFrom)) &&
          (!offer.validTo || now <= new Date(offer.validTo))
      );

      if (!activeCoupon) {
        return res.status(400).json({
          isSuccess: false,
          message: "Invalid or expired coupon code",
        });
      }

      return res.status(200).json({
        isSuccess: true,
        message: "Coupon verified successfully",
        discountType: activeCoupon.discountType,
        discountValue: activeCoupon.discountValue,
        minOrderValue: activeCoupon.minOrderValue,
        offerId: activeCoupon._id,
      });
    } catch (error) {
      console.error("Error verifying coupon:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
};

function applyOfferToProduct(product, offer, variantPrice, quantity) {
  switch (offer.offerType) {
    case "discount":
    case "common": {
      if (offer.discountType === "percent") {
        const discount = (offer.discountValue / 100) * variantPrice;
        return {
          discountedPrice: variantPrice - discount,
          discountAmount: discount,
          offerApplied: offer.title,
        };
      } else if (offer.discountType === "flat") {
        const discount = offer.discountValue;
        return {
          discountedPrice: Math.max(variantPrice - discount, 0),
          discountAmount: discount,
          offerApplied: offer.title,
        };
      }
      break;
    }

    case "bogo": {
      const eligibleQty = Math.floor(quantity / offer.buyQuantity);
      const freeQty = eligibleQty * offer.getQuantity;
      return {
        discountedPrice: variantPrice,
        freeProductId: offer.sameProduct ? product._id : offer.getProductId,
        freeQuantity: freeQty,
        offerApplied: offer.title,
      };
    }

    case "category": {
      const matchesCategory = offer.categoryIds.some((catId) =>
        product.productCategory
          .map((id) => id.toString())
          .includes(catId.toString())
      );
      if (matchesCategory) {
        const discount = (offer.discountValue / 100) * variantPrice;
        return {
          discountedPrice: variantPrice - discount,
          discountAmount: discount,
          offerApplied: offer.title,
        };
      }
      break;
    }

    default:
      return { discountedPrice: variantPrice };
  }
}
