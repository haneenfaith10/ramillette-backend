const Product = require("../models/productModel");
const Country = require("../models/countryModel");
const Order = require("../models/orderModel");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const Offers = require("../models/offerModel");

module.exports = {
  addProduct: async (req, res) => {
    try {
      const {
        productName,
        productShortName,
        productPrice,
        productDiscount,
        productDescription,
        productStock,
        productBenefits,
        productUseCase,
        productRating,
        productIngredients,
        productOtherInfo,
        productFAQ,
        productCategory,
        selectedCountries,
        countryPrices,
        badges,
        specialOffers,
        countryVariants,
        imageOrientations,
      } = req.body;

      // Parse JSON strings
      const parsedFAQ =
        typeof productFAQ === "string" ? JSON.parse(productFAQ) : productFAQ;

      const parsedCategory =
        typeof productCategory === "string"
          ? JSON.parse(productCategory)
          : productCategory;

      const parsedCountries =
        typeof selectedCountries === "string"
          ? JSON.parse(selectedCountries)
          : selectedCountries;
      const parsedCountryPrices =
        typeof countryPrices === "string"
          ? JSON.parse(countryPrices)
          : countryPrices;

      const parsedSpecialOffers =
        typeof specialOffers === "string"
          ? JSON.parse(specialOffers)
          : specialOffers;
      const parsedCountryVariants =
        typeof countryVariants === "string"
          ? JSON.parse(countryVariants)
          : countryVariants;
      const parsedImageOrientations =
        typeof imageOrientations === "string"
          ? JSON.parse(imageOrientations)
          : imageOrientations;

      // Parse productBenefits
      const parsedBenefits = Array.isArray(productBenefits)
        ? productBenefits
        : productBenefits
            .split(/\r?\n|,/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0);

      // Parse productUseCase
      const parsedUseCase = Array.isArray(productUseCase)
        ? productUseCase
        : productUseCase
            .split(/\r?\n|,/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0);

      // Handle image uploads
      if (!req.files) {
        return res.status(400).json({
          isSuccess: false,
          message: "Images required!",
        });
      }

      const parsedBadges = typeof badges === "string" ? JSON.parse(badges) : [];

      // const imagePaths = req.files.map((file) => file.path.replace(/\\/g, "/"));
      const imagePaths = req.files.map((file, index) => ({
        path: file.path.replace(/\\/g, "/"),
        orientation: parsedImageOrientations[index] || "landscape",
      }));

      // Create product
      const newProduct = {
        productName,
        productShortName,
        productPrice,
        productDiscount,
        productDescription,
        productStock,
        productBenefits: parsedBenefits,
        productUseCase: parsedUseCase,
        productRating,
        productImages: imagePaths,
        productIngredients,
        productOtherInfo,
        productFAQ: parsedFAQ,
        productCategory: parsedCategory,
        countries: parsedCountries,
        countryPrices: parsedCountryPrices,
        featureBadges: parsedBadges,
        specialOffers: parsedSpecialOffers,
        countryVariants: parsedCountryVariants,
      };

      console.log(newProduct, "newProduct");

      await Product.create(newProduct);

      res.status(201).json({
        isSuccess: true,
        message: "Product added successfully",
      });
    } catch (error) {
      console.error("Error adding product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getAllProducts: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search || "";

      const skip = (page - 1) * limit;

      const searchQuery = search
        ? {
            productName: { $regex: search, $options: "i" },
            isDelete: false,
          }
        : { isDelete: false };

      const [products, total] = await Promise.all([
        Product.find(searchQuery)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .populate("countries productCategory featureBadges specialOffers"),
        Product.countDocuments(searchQuery),
      ]);
      //  countryPrices.country
      res.status(200).json({
        isSuccess: true,
        message: "Products fetched successfully",
        products,
        total,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  // function to get a single product by ID
  getSingleProduct: async (req, res) => {
    try {
      const { id } = req.params;
      const { countryCode } = req.query;

      if (!id) {
        return res.status(400).json({ message: "Product ID is required" });
      }

      if (!countryCode) {
        return res.status(400).json({ message: "Country code is required" });
      }

      const country = await Country.findById(countryCode);
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }

      const product = await Product.findById(id).populate([
        "countries",
        "productCategory",
        "featureBadges",
        "specialOffers",
      ]);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      const countryVariants =
        product.countryVariants instanceof Map
          ? Object.fromEntries(product.countryVariants)
          : product.countryVariants;

      const variantList = countryVariants[country._id.toString()] || [];

      const defaultVariant = variantList[0];
      const productPrice = defaultVariant?.price || 0;

      res.status(200).json({
        isSuccess: true,
        message: "Product fetched successfully",
        product: {
          ...product.toObject(),
          productPrice,
          currencyCode: country.code,
          countryName: country.name,
          variants: variantList,
        },
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const { id } = req.params;
      // Find the product by ID
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      // Delete the product
      await Product.updateOne({ _id: id }, { isDelete: true });
      res.status(200).json({
        isSuccess: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  updateProductStatus: async (req, res) => {
    try {
      const { id } = req.params;

      // Find the product by ID
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Update the product status
      await Product.updateOne({ _id: id }, { status: !product.status });

      res.status(200).json({
        isSuccess: true,
        message: `Product status updated successfully`,
      });
    } catch (error) {
      console.error("Error updating product status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  // function to update product details
  updateProduct: async (req, res) => {
    try {
      const { productId } = req.params;

      // Helper: always return an array
      const toArray = (v) => (Array.isArray(v) ? v : v != null ? [v] : []);

      // Helper: try JSON.parse only when valid JSON
      const safeParse = (value) => {
        try {
          return typeof value === "string" ? JSON.parse(value) : value;
        } catch {
          return value;
        }
      };

      const {
        productName,
        productDescription,
        productShortName,
        productDiscount,
        productRating,
        productIngredients,
        productOtherInfo,
        productCategory,
        productBenefits,
        productUseCase,
        productFAQ,
        selectedCountries,
        existingImages = [],
        existingImageOrientations = [],
        featureBadges,
        specialOffers,
        newImageOrientations = [],
        countryVariants,
      } = req.body;

      // Parse fields safely
      const parsedProductFAQ = safeParse(productFAQ);
      const parsedSelectedCountries = safeParse(selectedCountries);
      const parsedFeatureBadges = safeParse(featureBadges);
      const parsedCategory = safeParse(productCategory);
      const parsedCountryVariants = safeParse(countryVariants);
      const parsedSpecialOffers = safeParse(specialOffers);
      const parsedExistingOrientations = toArray(existingImageOrientations);
      const parsedNewOrientations = toArray(safeParse(newImageOrientations));

      // Normalize existing images → { path, orientation }
      const existingImagesArr = toArray(existingImages);
      const normalizedExistingImages = existingImagesArr.map((img, i) => {
        if (typeof img === "string") {
          return {
            path: img,
            orientation: parsedExistingOrientations[i] || "landscape",
          };
        }
        return img; // already formatted correctly
      });

      // Handle new uploaded files (req.files -> array because of upload.array("newImages"))
      const uploadedNewFiles = (req.files ?? []).map((file, i) => ({
        path: file.path.replace(/\\/g, "/"),
        orientation: parsedNewOrientations[i] || "landscape",
      }));

      // Final combined images
      const finalImages = [...normalizedExistingImages, ...uploadedNewFiles];

      // Prepare update object
      const updateFields = {
        productName,
        productDescription,
        productShortName,
        productDiscount: Number(productDiscount),
        productRating: Number(productRating),
        productIngredients,
        productOtherInfo,
        productCategory: parsedCategory,
        productBenefits: Array.isArray(productBenefits)
          ? productBenefits
          : productBenefits.split("\n").filter((b) => b.trim() !== ""),
        productUseCase: Array.isArray(productUseCase)
          ? productUseCase
          : productUseCase.split("\n").filter((u) => u.trim() !== ""),
        productFAQ: parsedProductFAQ,
        productImages: finalImages, // <— IMPORTANT ✅
        countries: parsedSelectedCountries,
        featureBadges: parsedFeatureBadges,
        specialOffers: parsedSpecialOffers,
        countryVariants: parsedCountryVariants,
      };

      await Product.findByIdAndUpdate(productId, updateFields, { new: true });

      return res
        .status(200)
        .json({ isSuccess: true, message: "Product updated successfully" });
    } catch (error) {
      console.error("Error while updating product details:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // function to get the best selling products
  getBestSellingProducts: async (req, res) => {
    try {
      const result = await Order.aggregate([
        { $unwind: "$orderItems" },
        {
          $group: {
            _id: "$orderItems.productId",
            totalSold: { $sum: "$orderItems.qty" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 20 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $match: {
            "product.isDelete": { $ne: true },
          },
        },
        {
          $project: {
            productId: "$_id",
            totalSold: 1,
            productName: "$product.productName",
            productImages: "$product.productImages",
            productStock: "$product.productStock",
            productRating: "$product.productRating",
            productDiscount: "$product.productDiscount",
          },
        },
      ]);
      res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched best seller products",
        products: result,
      });
    } catch (error) {
      console.error("Error while getting best seller products:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  productSearch: async (req, res) => {
    try {
      const { query, countryId } = req.query;

      if (!query || query.trim() === "") {
        return res.status(400).json({
          isSuccess: false,
          message: "Query is required",
        });
      }

      if (!countryId) {
        return res.status(400).json({
          isSuccess: false,
          message: "countryId is required",
        });
      }

      const countryObjectId = new mongoose.Types.ObjectId(countryId);
      const trimmedQuery = query.trim();
      const regexFull = new RegExp(trimmedQuery, "i");
      const words = trimmedQuery.split(/\s+/);
      const regexWords = words.map((w) => new RegExp(w, "i"));

      // Build text search conditions
      const orConditions = [
        { productName: regexFull },
        { productShortName: regexFull },
        { productDescription: regexFull },
        { productIngredients: regexFull },
        ...regexWords.map((r) => ({ productName: r })),
        ...regexWords.map((r) => ({ productShortName: r })),
        ...regexWords.map((r) => ({ productDescription: r })),
        ...regexWords.map((r) => ({ productIngredients: r })),
      ];

      // Numeric terms for price filter
      const priceTerms = words.map(parseFloat).filter((n) => !isNaN(n));

      if (priceTerms.length > 0) {
        priceTerms.forEach((enteredPrice) => {
          orConditions.push({
            countryPrices: {
              $elemMatch: {
                country: countryObjectId,
                price: enteredPrice,
              },
            },
          });

          orConditions.push({
            $expr: {
              $in: [
                enteredPrice,
                {
                  $map: {
                    input: "$countryPrices",
                    as: "cp",
                    in: {
                      $cond: [
                        { $eq: ["$$cp.country", countryObjectId] },
                        {
                          $subtract: [
                            "$$cp.price",
                            {
                              $multiply: [
                                "$$cp.price",
                                { $divide: ["$productDiscount", 100] },
                              ],
                            },
                          ],
                        },
                        null,
                      ],
                    },
                  },
                },
              ],
            },
          });
        });
      }

      const products = await Product.find({
        $and: [
          { $or: orConditions },
          { countries: countryObjectId },
          { isDelete: false },
          { status: true },
        ],
      }).select(
        "productName productShortName productImages countryPrices productDiscount"
      );

      // Filter country-specific price and format results
      const formattedResults = products.map((product) => {
        // const countryPriceObj = product.countryPrices.find((p) =>
        //   p.country.equals(countryObjectId)
        // );
        return {
          _id: product._id,
          productName: product.productName,
          productShortName: product.productShortName,
          productImages: product.productImages,
          // price:y countryPriceObj ? countryPriceObj.price : null,
          discount: product.productDiscount,
        };
      });

      res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched product search suggestions",
        suggestions: formattedResults,
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Search failed",
      });
    }
  },
  // function to get the search result products
  getSearchResult: async (req, res) => {
    try {
      const { query, countryId } = req.query;

      if (!query || query.trim() === "") {
        return res.status(400).json({
          isSuccess: false,
          message: "Query is required",
        });
      }

      if (!countryId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Country ID is required",
        });
      }

      const country = await Country.findById(countryId);
      if (!country) {
        return res.status(404).json({
          isSuccess: false,
          message: "Country not found",
        });
      }

      const trimmedQuery = query.trim();
      const regexFull = new RegExp(trimmedQuery, "i");
      const words = trimmedQuery.split(/\s+/);
      const regexWords = words.map((w) => new RegExp(w, "i"));

      // Build text search conditions
      const orConditions = [
        { productName: regexFull },
        { productShortName: regexFull },
        { productDescription: regexFull },
        { productIngredients: regexFull },
        ...regexWords.map((r) => ({ productName: r })),
        ...regexWords.map((r) => ({ productShortName: r })),
        ...regexWords.map((r) => ({ productDescription: r })),
        ...regexWords.map((r) => ({ productIngredients: r })),
      ];

      const products = await Product.find({
        $and: [
          { $or: orConditions },
          { isDelete: false },
          { status: true },
          { countries: country._id },
        ],
      })
        .populate("productCategory")
        .lean();

      const filteredProducts = products.map((product) => {
        const { countryVariants, ...rest } = product;
        const variantsForCountry = countryVariants?.[countryId] || [];

        return {
          ...rest,
          countryVariants: {
            [countryId]: variantsForCountry,
          },
        };
      });

      const allVariantPrices = filteredProducts
        .flatMap((product) =>
          (product.countryVariants[countryId] || []).map((variant) => {
            const basePrice = Number(variant.price);
            const discount = Number(product.productDiscount || 0);
            return basePrice - (basePrice * discount) / 100;
          })
        )
        .filter((price) => !isNaN(price));

      const minPrice =
        allVariantPrices.length > 0 ? Math.min(...allVariantPrices) : 0;
      const maxPrice =
        allVariantPrices.length > 0 ? Math.max(...allVariantPrices) : 0;

      return res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched product search results",
        products: filteredProducts,
        priceRange: { min: minPrice, max: maxPrice },
      });
    } catch (error) {
      console.error("Search error:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to get all the  product for the admin
  getAllProductsForAdmin: async (req, res) => {
    try {
      const products = await Product.find({ status: true, isDelete: false });
      res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched all products!",
        products,
      });
    } catch (error) {
      console.error("Error while getting product for admin:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  getCheckoutDetailsWithOffers: async (req, res) => {
    try {
      const userId = req.userId;
      const { countryId } = req.query;

      if (!countryId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Country ID is required",
        });
      }

      /* ---------------------------------------------------
       * 1. Fetch User (NO POPULATE)
       * --------------------------------------------------- */
      const user = await User.findById(userId).lean();

      if (!user || !user.cart?.items?.length) {
        return res.status(200).json({
          isSuccess: true,
          cartItems: [],
          newUserOffer: null,
          message: "Cart is empty",
        });
      }

      /* ---------------------------------------------------
       * 2. Extract Product IDs from Cart
       * --------------------------------------------------- */
      const productIds = user.cart.items.map((item) => item.productId);

      /* ---------------------------------------------------
       * 3. Fetch All Products in ONE Query
       * --------------------------------------------------- */
      const products = await Product.find({
        _id: { $in: productIds },
        countries: countryId,
      })
        .populate([
          {
            path: "specialOffers",
            match: {
              isActive: true,
              offerType: { $ne: "new-customer" },
            },
            populate: [
              { path: "buyProductId", model: "Product" },
              { path: "getProductId", model: "Product" },
            ],
          },
          { path: "productCategory" },
        ])
        .lean();

      /* ---------------------------------------------------
       * 4. Convert Products to Map (O(1) lookup)
       * --------------------------------------------------- */
      const productMap = new Map(
        products.map((product) => [product._id.toString(), product])
      );

      /* ---------------------------------------------------
       * 5. Check if User is New + Fetch Global Offer
       * --------------------------------------------------- */
      const hasPreviousOrder = await Order.exists({ user: userId });

      const globalNewUserOffer = !hasPreviousOrder
        ? await Offers.findOne({
            offerType: "new-customer",
            isActive: true,
            $or: [
              { productIds: { $size: 0 } },
              { productIds: { $exists: false } },
            ],
          }).lean()
        : null;

      /* ---------------------------------------------------
       * 6. Process Cart Items (NO DB CALLS)
       * --------------------------------------------------- */
      const now = new Date();
      const response = [];

      for (const item of user.cart.items) {
        const product = productMap.get(item.productId.toString());
        if (!product) continue;

        const variants = product.countryVariants?.[countryId.toString()] || [];

        const selectedVariant = variants[0] || null;
        const basePrice = selectedVariant?.price || item.price || 0;

        const applicableOffers = [];

        for (const offer of product.specialOffers || []) {
          const isValid =
            (!offer.validFrom || now >= new Date(offer.validFrom)) &&
            (!offer.validTo || now <= new Date(offer.validTo));

          if (!isValid) continue;

          const offerResult = applyOfferToProduct(
            product,
            offer,
            basePrice,
            item.qty
          );

          if (offerResult) {
            applicableOffers.push({
              offerId: offer._id,
              ...offer,
            });
          }
        }

        applicableOffers.sort(
          (a, b) => (a.minOrderValue || 0) - (b.minOrderValue || 0)
        );

        response.push({
          productId: product._id,
          productName: product.productName,
          productDescription: product.productDescription,
          productImages: product.productImages,
          basePrice,
          productDiscount: product.productDiscount,
          qty: item.qty,

          productVariants: variants.map((v) => ({
            _id: v._id || null,
            variantName: v.variantName,
            price: v.price,
            stock: v.stock,
          })),

          selectedVariant: selectedVariant
            ? {
                _id: selectedVariant._id,
                variantName: selectedVariant.variantName,
                price: selectedVariant.price,
                stock: selectedVariant.stock,
              }
            : null,

          offers: applicableOffers,
        });
      }

      /* ---------------------------------------------------
       * 7. Send Response
       * --------------------------------------------------- */
      return res.status(200).json({
        isSuccess: true,
        cartItems: response,
        newUserOffer: globalNewUserOffer || null,
      });
    } catch (error) {
      console.error("Error fetching checkout details:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
};

// Offer application helper
function applyOfferToProduct(product, offer, variantPrice, quantity) {
  switch (offer.offerType) {
    case "discount":
    case "common":
    case "coupon": {
      if (offer.discountType === "percent") {
        const discount = (offer.discountValue / 100) * variantPrice;
        return {
          discountedPrice: variantPrice - discount,
          discountAmount: discount,
        };
      } else if (offer.discountType === "flat") {
        const discount = offer.discountValue;
        return {
          discountedPrice: Math.max(variantPrice - discount, 0),
          discountAmount: discount,
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
      };
    }

    default:
      return { discountedPrice: variantPrice };
  }
}
