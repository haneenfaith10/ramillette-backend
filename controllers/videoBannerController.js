const VideoBanner = require("../models/videoBannerModel");
const path = require("path");
const fs = require("fs");
module.exports = {
  createVideoBanner: async (req, res) => {
    try {
      const { content } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: "Video file is required" });
      }

      const videoUrl = path.join("uploads/videos", req.file.filename);

      const banner = new VideoBanner({ content, videoUrl });
      await banner.save();

      res
        .status(200)
        .json({ isSuccess: true, message: "Video banner created", banner });
    } catch (error) {
      console.error("Error adding video banner:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
  getVideoBanners: async (req, res) => {
    try {
      const banners = await VideoBanner.find({
        isDeleted: false,
      }).sort({ createdAt: -1 });
      res.status(200).json({
        isSuccess: true,
        message: "Banner data fetched successfully",
        banners,
      });
    } catch (error) {
      console.error("Error fetching banners:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
  // function to fetch the banner for user
  getVideoBannerForUser: async (req, res) => {
    try {
      const banners = await VideoBanner.find({
        isActive: true,
        isDeleted: false,
      }).sort({ createdAt: -1 });

      res.status(200).json({
        isSuccess: true,
        message: "Video banner fetched successfully",
        banner: banners[0],
      });
    } catch (error) {
      console.error("Error fetching banners for user:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
  // function to delete the video banner
  deleteVideoBanner: async (req, res) => {
    try {
      const { bannerId } = req.params;

      const deletedBanner = await VideoBanner.findByIdAndDelete(bannerId);

      if (!deletedBanner) {
        return res
          .status(404)
          .json({ success: false, message: "Video banner not found" });
      }

      // Optionally return all remaining banners
      const allBanners = await VideoBanner.find();

      res.status(200).json({
        isSuccess: true,
        message: "Video banner permanently deleted",
        banners: allBanners,
      });
    } catch (error) {
      console.error("Error deleting  banners by admin:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
  // function to get the banner details for edit the banner
  getVideoBannerById: async (req, res) => {
    try {
      const { bannerId } = req.params;

      const banner = await VideoBanner.findById(bannerId);

      if (!banner) {
        return res.status(404).json({
          success: false,
          message: "Video banner not found",
        });
      }

      res.status(200).json({
        isSuccess: true,
        message: "Banner details fetched successfully",
        banner,
      });
    } catch (error) {
      console.error("Error fetching video banner by ID:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
  // function is to update the video banner details
  updateVideoBanner: async (req, res) => {
    try {
      const { bannerId } = req.params;
      const { content } = req.body;

      const banner = await VideoBanner.findById(bannerId);
      if (!banner) {
        return res
          .status(404)
          .json({ success: false, message: "Banner not found" });
      }

      if (req.file) {
        // Remove old video file if exists
        if (banner.videoUrl) {
          const oldPath = path.join(
            "uploads/videos",
            path.basename(banner.videoUrl)
          );
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
        banner.videoUrl = path.join("uploads/videos", req.file.filename);
      }

      banner.content = content;
      await banner.save();

      res.status(200).json({
        isSuccess: true,
        message: "Video banner updated successfully",
        banner,
      });
    } catch (error) {
      console.error("Error updating video banner:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
  // function to change the video banner status
  changeVideoBannerStatus: async (req, res) => {
    try {
      const { bannerId } = req.params;

      const banner = await VideoBanner.findById(bannerId);

      if (!banner) {
        return res
          .status(404)
          .json({ isSuccess: false, message: "Banner not found" });
      }

      // Toggle isActive status
      banner.isActive = !banner.isActive;
      await banner.save();

      res.status(200).json({
        isSuccess: true,
        message: `Banner status updated to ${
          banner.isActive ? "active" : "inactive"
        }`,
        updatedBanner: banner,
      });
    } catch (error) {
      console.error("Error while changing the video banner status:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  },
};
