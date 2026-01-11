const mongoose = require("mongoose");
const Testimonial = require("../models/testimonialModel");
const ReviewModel = require("../models/reviewModel");

module.exports = {
  promoteToTestimonials: async (req, res) => {
    try {
      const { reviewId } = req.body;

      if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
        return res.status(400).json({
          isSuccess: false,
          message: "A valid review ID is required.",
        });
      }
      const review = await ReviewModel.findById(reviewId);

      if (!review) {
        return res.status(404).json({
          isSuccess: false,
          message: "Review not found",
        });
      }

      const existingTestimonial = await Testimonial.findOne({ reviewId });
      if (existingTestimonial) {
        // If exists → remove
        await Testimonial.deleteOne({ _id: existingTestimonial._id });
        review.isPromoted = false;
        await review.save();
        return res.status(200).json({
          isSuccess: true,
          message: "Removed from testimonials.",
        });
      } else {
        // If not exists → add
        await Testimonial.create({ reviewId });
        review.isPromoted = true;
        await review.save();
        return res.status(200).json({
          isSuccess: true,
          message: "Promoted to testimonial successfully.",
        });
      }
    } catch (error) {
      console.error("Error while promoting the review to testimonials:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to fetch the testimonials
  getTestimonialData: async (req, res) => {
    try {
      const testimonials = await Testimonial.find()
        .populate({
          path: "reviewId",
          populate: {
            path: "user",
            select: "firstName lastName userImage",
          },
        })
        .sort({ createdAt: -1 });
      const reviews = testimonials
        .map((item) => item.reviewId)
        .filter((review) => review !== null);
      return res.status(200).json({
        isSuccess: true,
        message: "Testimonials fetched successfully",
        testimonials: reviews,
      });
    } catch (error) {
      console.error("Error while getting the  testimonials:", error);
      return res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
};
