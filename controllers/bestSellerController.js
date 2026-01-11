const BestSeller = require("../models/bestSellerModel");
const path = require("path");
const fs = require("fs");

module.exports = {
  createBestSeller: async (req, res) => {
    try {
      const { country, product } = req.body;
      const videoFile = req.file;

      if (!country || !product || !videoFile) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const parsedCountry =
        typeof country === "string" ? JSON.parse(country) : country;

      const bestSeller = new BestSeller({
        country: parsedCountry.map((c) => c.value),
        product: JSON.parse(product).value,
        video: videoFile.path,
      });

      await bestSeller.save();
      res.status(200).json({
        message: "Best Seller created",
        isSuccess: true,
        data: bestSeller,
      });
    } catch (error) {
      console.error("Error creating best seller:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  // function to fetch the all best seller data for admin
  getAllBestSeller: async (req, res) => {
    try {
      const bestSellers = await BestSeller.find()
        .populate("product")
        .populate("country")
        .sort({ createdAt: -1 });
      res.status(200).json({
        message: "Best sellers fetched successfully",
        isSuccess: true,
        bestSellers,
      });
    } catch (error) {
      console.error("Error while fetching best seller data for admin:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  // function to delete the best seller data permanently
  deleteBestSeller: async (req, res) => {
    try {
      const { bestSellerId } = req.params;

      const bestSeller = await BestSeller.findById(bestSellerId);
      if (!bestSeller) {
        return res.status(404).json({ message: "Best seller not found" });
      }

      // Remove video file
      const videoPath = path.join(__dirname, "..", bestSeller.video);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }

      // Delete from DB
      await BestSeller.findByIdAndDelete(bestSellerId);

      const updatedBestSellers = await BestSeller.find()
        .populate("country")
        .populate("product");

      res.status(200).json({
        message: "Best seller deleted successfully",
        isSuccess: true,
        bestSellers: updatedBestSellers,
      });
    } catch (error) {
      console.error("Error while deleting best seller:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  // function to get the best seller single details
  getBestSellerById: async (req, res) => {
    try {
      const bestSellerId = req.params.id;

      const bestSeller = await BestSeller.findById(bestSellerId);

      if (!bestSeller) {
        return res.status(404).json({
          isSuccess: false,
          message: "Best seller not found",
        });
      }

      res.status(200).json({
        isSuccess: true,
        message: "Best seller data fetched successfully",
        bestSeller,
      });
    } catch (error) {
      console.error("Error fetching best seller by ID:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to update the best seller data
  updateBestSeller: async (req, res) => {
    try {
      const bestSellerId = req.params.id;
      const { country, product } = req.body;

      const parsedCountry = JSON.parse(country);
      const parsedProduct = product;

      const updateData = {
        country: parsedCountry.map((c) => c.value),
        product: product,
      };

      // If a new video is uploaded, remove the old video
      if (req.file) {
        const existingBestSeller = await BestSeller.findById(bestSellerId);

        if (existingBestSeller?.video) {
          const oldVideoPath = path.join(
            process.cwd(),
            existingBestSeller.video
          );

          // Check if file exists and delete it
          if (fs.existsSync(oldVideoPath)) {
            fs.unlinkSync(oldVideoPath);
          }
        }

        updateData.video = req.file.path;
      }

      const updated = await BestSeller.findByIdAndUpdate(
        bestSellerId,
        updateData,
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({
          isSuccess: false,
          message: "Best Seller not found",
        });
      }

      res.status(200).json({
        isSuccess: true,
        message: "Best Seller updated successfully",
        bestSeller: updated,
      });
    } catch (error) {
      console.error("Error updating best seller:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
  // function to get best seller data for user
  getBestSellerForUser: async (req, res) => {
    try {
      const { countryId } = req.query;

      if (!countryId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Country ID is required",
        });
      }

      // Find best sellers that match the given country
      const bestSellers = await BestSeller.find({ country: countryId })
        .populate({
          path: "product",
          select:
            "productName productImages productDiscount productRating productStock productDescription",
        })
        .populate({
          path: "country",
          select: "name flagUrl",
        });

      res.status(200).json({
        isSuccess: true,
        message: "Best Sellers fetched successfully",
        bestSellers,
      });
    } catch (error) {
      console.error("Error fetching best sellers for user:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal server error",
      });
    }
  },
};
