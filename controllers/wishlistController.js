const User = require("../models/userModel");

module.exports = {
  addToWishlist: async (req, res) => {
    try {
      const { userId, productId } = req.body;
      const { countryId } = req.query;

      if (!countryId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Country ID is required",
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          isSuccess: false,
          message: "User data not found!",
        });
      }

      const productExists = user.wishlist.products.some(
        (item) => item.product.toString() === productId
      );

      if (productExists) {
        return res.status(400).json({
          isSuccess: false,
          message: "Product is already in the wishlist",
        });
      }

      await User.findByIdAndUpdate(userId, {
        $push: {
          "wishlist.products": { product: productId },
        },
      });

      const updatedUser = await User.findById(userId)
        .select("firstName lastName email wishlist cart")
        .populate({
          path: "wishlist.products.product",
          populate: {
            path: "productCategory",
          },
        });

      const filteredWishlist = updatedUser.wishlist.products.filter((item) => {
        const product = item.product;
        if (!product || !product.countryVariants) return false;

        const hasVariantForCountry =
          product.countryVariants.get?.(countryId.toString())?.length > 0;

        const isAvailableInCountry = product.countries.some(
          (c) => c.toString() === countryId
        );

        return (
          hasVariantForCountry &&
          isAvailableInCountry &&
          product.status &&
          !product.isDelete
        );
      });

      const responseData = {
        ...updatedUser.toObject(),
        wishlist: { products: filteredWishlist },
      };

      res.status(200).json({
        isSuccess: true,
        message: "Product added to wishlist",
        user: responseData,
      });
    } catch (error) {
      console.error("Error adding product to wishlist:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  removeFromWishlist: async (req, res) => {
    try {
      const { userId, productId } = req.body;
      const { countryId } = req.query;

      if (!countryId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Country ID is required",
        });
      }

      if (!userId || !productId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Product ID and User Id is required",
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          isSuccess: false,
          message: "User data not found!!",
        });
      }

      // Check if product exists in wishlist
      const productExists = user.wishlist.products.some(
        (item) => item.product.toString() === productId
      );

      if (!productExists) {
        return res.status(400).json({
          isSuccess: false,
          message: "Product not found in wishlist",
        });
      }

      // Remove product from wishlist
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        {
          $pull: {
            "wishlist.products": { product: productId },
          },
        },
        {
          new: true,
          select: "firstName lastName email wishlist cart",
        }
      ).populate({
        path: "wishlist.products.product",
        populate: {
          path: "countries", // populate countries for filtering
          model: "Country",
        },
      });

      // Filter wishlist products based on the selected country
      const filteredWishlist = updatedUser.wishlist.products.filter((item) => {
        const product = item.product;
        if (!product || !product.countries) return false;

        return product.countries.some(
          (country) => country._id?.toString() === countryId
        );
      });

      res.status(200).json({
        isSuccess: true,
        message: "Product removed from wishlist and filtered by country",
        user: {
          ...updatedUser.toObject(),
          wishlist: {
            products: filteredWishlist,
          },
        },
      });
    } catch (error) {
      console.error("Error removing product from wishlist:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  // function to fetch the user wishlist details
  getUserWishlist: async (req, res) => {
    try {
      const { userid } = req.headers;

      const response = await User.findById(userid);

      if (!response) {
        return res.status(404).json({
          isSuccess: false,
          message: "User not found !!",
        });
      }
      res.status(200).json({
        isSuccess: true,
        message: "User data fetched successfully",
        user: response,
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getUserWishlistDetails: async (req, res) => {
    try {
      const { userid } = req.headers;
      const { countryId } = req.params;

      const userData = await User.findById(userid).populate(
        "wishlist.products.product"
      );
      if (!userData) {
        return res.status(404).json({
          isSuccess: false,
          message: "User data not found for fetch wishlist details",
        });
      }

      console.log(userData, "userDataslafdlj");

      res.status(200).json({
        isSuccess: true,
        message: "User wishlist details fetched successfully",
        wishlist: userData.wishlist,
      });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
};
