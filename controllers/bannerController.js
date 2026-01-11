const Banner = require("../models/bannerModel");
const Country = require("../models/countryModel");

module.exports = {
  createBanner: async (req, res) => {
    try {
      const { content, link, countryIds } = req.body;
      const image = req.file;

      if (!image) {
        return res.status(400).json({ message: "Image file is required" });
      }

      const newBanner = new Banner({
        content,
        imageUrl: image.path,
        link,
        countries: countryIds,
      });

      await newBanner.save();
      res.status(200).json({
        isSuccess: true,
        message: "Banner created",
        banner: newBanner,
      });
    } catch (error) {
      console.error("Banner upload error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  // get all banners by the admin
  getAllBanners: async (req, res) => {
    try {
      const banners = await Banner.find().populate("countries");
      res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched banner data!",
        banners,
      });
    } catch (error) {
      console.error("Error while getting all the banners:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  // function to get the banner for the user
  getBannerForUser: async (req, res) => {
    try {
      const { countryCode } = req.query;

      if (!countryCode) {
        return res
          .status(400)
          .json({ isSuccess: false, message: "Country code is required." });
      }

      const country = await Country.findById(countryCode);

      if (!country) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "Country not found." });
      }
      const banners = await Banner.find({
        countries: country._id,
        isActive: true,
      });

      res.status(200).json({
        isSuccess: true,
        message: "Banners fetched successfully.",
        banners,
      });
    } catch (error) {
      console.error("Error while getting all the banners for user:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  // function to delete the banner data
  deleteBanner: async (req, res) => {
    try {
      const { bannerId } = req.params;

      // Permanently delete the banner
      const deletedBanner = await Banner.findByIdAndDelete(bannerId);

      if (!deletedBanner) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "Banner not found" });
      }

      // Return all remaining banners
      const banners = await Banner.find().populate("countries");

      return res.status(200).json({
        isSuccess: true,
        message: "Banner permanently deleted successfully",
        banners,
      });
    } catch (error) {
      console.error("Error while permanently deleting banner:", error);
      return res
        .status(500)
        .json({ isSuccess: false, message: "Internal Server Error" });
    }
  },
  // get banner details by banner id
  getBannerById: async (req, res) => {
    try {
      const { bannerId } = req.params;
      if (!bannerId) {
        return res
          .status(400)
          .json({ isSuccess: false, message: "Banner ID is required" });
      }

      const banner = await Banner.findOne({ _id: bannerId }).populate(
        "countries"
      );

      if (!banner) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "Banner not found" });
      }
      console.log(banner, "lilikoiil");
      return res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched banner details",
        banner,
      });
    } catch (error) {
      console.error("Error while getting banner details:", error);
      return res
        .status(500)
        .json({ isSuccess: false, message: "Internal Server Error" });
    }
  },
  // function to update banner details
  updateBannerDetails: async (req, res) => {
    try {
      const { bannerId } = req.params;
      console.log(req.body);
      const { content, link, countryIds } = req.body;

      const updatedFields = {
        content,
        link,
        countries: countryIds,
        // isActive,
      };
      if (req.file) {
        // Assuming multer is used and saves the image as `req.file.filename`
        updatedFields.imageUrl = `uploads/banners/${req.file.filename}`;
      }
      const updatedBanner = await Banner.findByIdAndUpdate(
        bannerId,
        updatedFields,
        { new: true }
      );
      if (!updatedBanner) {
        return res
          .status(404)
          .json({ success: false, message: "Banner not found" });
      }

      return res.status(200).json({
        isSuccess: true,
        message: "Banner details updated successfully",
        banner: updatedBanner,
      });
    } catch (error) {
      console.error("Error while updating banner details:", error);
      return res
        .status(500)
        .json({ isSuccess: false, message: "Internal Server Error" });
    }
  },
  // function to change the status of the banner
  toggleBannerStatus: async (req, res) => {
    try {
      const { bannerId } = req.params;
      // Find banner by ID
      const banner = await Banner.findById(bannerId);
      if (!banner) {
        return res
          .status(404)
          .json({ success: false, message: "Banner not found" });
      }

      // Toggle the isActive field
      banner.isActive = !banner.isActive;
      await banner.save();

      // Fetch all banners after update
      const allBanners = await Banner.find().populate("countries");

      return res.status(200).json({
        isSuccess: true,
        message: `Banner status updated to ${
          banner.isActive ? "Active" : "Inactive"
        }`,
        banners: allBanners,
      });
    } catch (error) {
      console.error("Error toggling banner status:", error);
      return res.status(500).json({ success: false, message: "Server error" });
    }
  },
};
