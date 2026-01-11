const Reviews = require("../models/reviewModel");
const mongoose = require("mongoose");
const Product = require("../models/productModel");

module.exports = {
  postRating: async (req, res) => {
    try {
      const { rating, content, countryId } = req.body;
      const { productId } = req.params;
      const userId = req.userId;

      if (!productId || !rating || !content || !countryId) {
        return res.status(400).json({
          isSuccess: false,
          message:
            "All fields (productId, rating, content, countryId) are required.",
        });
      }
      const existingRating = await Reviews.findOne({ productId, user: userId });

      let savedRating;
      if (existingRating) {
        // Update existing rating
        existingRating.rating = rating;
        existingRating.content = content;
        savedRating = await existingRating.save();
      } else {
        // Create new rating
        const newRating = new Reviews({
          productId,
          user: userId,
          rating,
          content,
          countryId,
        });
        savedRating = await newRating.save();
      }
      const allRatings = await Reviews.find({ productId });
      const ratingSum = allRatings.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = ratingSum / allRatings.length;

      await Product.findByIdAndUpdate(productId, {
        productRating: averageRating.toFixed(1),
        ratingCount: allRatings.length,
      });

      return res.status(200).json({
        isSuccess: true,
        message: "Rating submitted successfully.",
        rating: savedRating,
      });
    } catch (error) {
      console.error("Error in postRating:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error.",
      });
    }
  },
  // function to fetch the product reviews
  // getProductReviews: async (req, res) => {
  //   try {
  //     const { productId } = req.params;
  //     const { countryId, userId } = req.query;

  //     if (!productId) {
  //       return res.status(400).json({
  //         isSuccess: false,
  //         message: "Product ID is required.",
  //       });
  //     }

  //     const filter = {
  //       productId: new mongoose.Types.ObjectId(productId),
  //       $or: [
  //         { status: true }, // Public reviews
  //         { user: new mongoose.Types.ObjectId(userId) }, // Own review (even if status: false)
  //       ],
  //     };
  //     // if (countryId) {
  //     //   filter.countryId = new mongoose.Types.ObjectId(countryId);
  //     // }

  //     const reviews = await Reviews.find(filter)
  //       .populate("user", "firstName lastName userImage")
  //       .sort({ createdAt: -1 });

  //     return res.status(200).json({
  //       isSuccess: true,
  //       message: "Product reviews fetched successfully.",
  //       reviews,
  //     });
  //   } catch (error) {
  //     console.error("Error fetching product reviews:", error);
  //     return res.status(500).json({
  //       isSuccess: false,
  //       message: "Internal server error.",
  //     });
  //   }
  // },
  getProductReviews: async (req, res) => {
    try {
      const { productId } = req.params;
      const { countryId, userId } = req.query;

      if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json({
          isSuccess: false,
          message: "Valid Product ID is required.",
        });
      }

      const filter = {
        productId: new mongoose.Types.ObjectId(productId),
      };

      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        filter.$or = [
          { status: true },
          { user: new mongoose.Types.ObjectId(userId) },
        ];
      } else {
        filter.status = true;
      }

      // Optional: Filter by country
      // if (countryId && mongoose.Types.ObjectId.isValid(countryId)) {
      //   filter.countryId = new mongoose.Types.ObjectId(countryId);
      // }

      const reviews = await Reviews.find(filter)
        .populate("user", "firstName lastName userImage")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        isSuccess: true,
        message: "Product reviews fetched successfully.",
        reviews,
      });
    } catch (error) {
      console.error("Error fetching product reviews:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error.",
      });
    }
  },
  // function to fetch all the reviews
  getAllReviews: async (req, res) => {
    try {
      const { countryId, userId } = req.query;

      if (!countryId || !mongoose.Types.ObjectId.isValid(countryId)) {
        return res.status(400).json({
          isSuccess: false,
          message: "Valid countryId is required.",
        });
      }

      const query = {
        countryId: new mongoose.Types.ObjectId(countryId),
      };

      // Conditionally include user's own review if userId is provided and valid
      if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        query.$or = [
          { status: true },
          { user: new mongoose.Types.ObjectId(userId) },
        ];
      } else {
        // Only fetch public reviews
        query.status = true;
      }

      const reviews = await Reviews.find(query)
        .populate("user", "firstName lastName userImage")
        .populate("productId", "productName")
        .sort({ rating: -1, createdAt: -1 });

      res.status(200).json({
        isSuccess: true,
        message: "Reviews fetched successfully.",
        reviews,
      });
    } catch (error) {
      console.error("Error fetching sorted reviews by country:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to get all the reviews for admin to manage the reviews
  getAllReviewsForAdmin: async (req, res) => {
    try {
      const reviews = await Reviews.find()
        .populate("user productId countryId")
        .sort({ createdAt: -1 });
      res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched reviews for admin",
        reviews,
      });
    } catch (error) {
      console.error("Error fetching all reviews for admin:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to change the status of the review by admin
  updateReviewStatus: async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { status } = req.body;
      if (status === null || status === undefined) {
        return res
          .status(400)
          .json({ isSuccess: false, message: "Status is required" });
      }

      const review = await Reviews.findByIdAndUpdate(
        reviewId,
        { status },
        { new: true }
      )
        .populate("user productId countryId")
        .sort({ createdAt: -1 });

      if (!review) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "Review not found" });
      }

      const allReviews = await Reviews.find()
        .populate("user productId countryId")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        isSuccess: true,
        message: "Review status updated successfully",
        reviews: allReviews,
      });
    } catch (error) {
      console.error("Error while updating status of the review:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
};
