const Badge = require("../models/badgeModel");

module.exports = {
  createBadge: async (req, res) => {
    try {
      const { label } = req.body;

      if (!label || !req.file) {
        return res
          .status(400)
          .json({ isSuccess: false, message: "Label and icon are required." });
      }

      const iconUrl = `/uploads/badges/${req.file.filename}`;

      const newBadge = new Badge({
        label,
        iconUrl,
      });

      await newBadge.save();

      res.status(200).json({
        isSuccess: true,
        message: "Badge created successfully",
        badge: newBadge,
      });
    } catch (error) {
      console.error("Create Badge Error:", error);
      res.status(500).json({ message: "Server error while creating badge." });
    }
  },
  getAllBadges: async (req, res) => {
    try {
      const badges = await Badge.find({ status: true }).sort({ createdAt: -1 });
      res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched badges data !",
        badges,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  },
  getBadgeDetails: async (req, res) => {
    try {
      const { id } = req.params;

      const badge = await Badge.findById(id);
      if (!badge) {
        return res.status(404).json({ message: "Badge not found" });
      }

      res.status(200).json({
        isSuccess: true,
        message: "successfully fetched badge details",
        badge,
      });
    } catch (error) {
      console.error("Error fetching badge details:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  // function to update the badge details
  updateBadge: async (req, res) => {
    try {
      const { badgeId } = req.params;
      const { label } = req.body;
      const iconUrl = req.file ? `/uploads/${req.file.filename}` : null;

      // Find the existing badge
      const badge = await Badge.findById(badgeId);
      if (!badge) {
        return res.status(404).json({ message: "Badge not found" });
      }

      // Update fields
      if (label) badge.label = label;
      if (iconUrl) badge.iconUrl = iconUrl;

      // Save the updated badge
      await badge.save();

      res.status(200).json({
        isSuccess: true,
        message: "Badge updated successfully",
      });
    } catch (error) {
      console.error("Error while updating the badge details:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  //   function to delete the badge
  deleteBadge: async (req, res) => {
    try {
      const { badgeId } = req.params;

      const updatedBadge = await Badge.findByIdAndUpdate(
        badgeId,
        { status: false },
        { new: true }
      );

      if (!updatedBadge) {
        return res.status(404).json({ message: "Badge not found" });
      }
      const badges = await Badge.find({ status: true }).sort({ createdAt: -1 });
      res.status(200).json({
        isSuccess: true,
        message: "Badge soft-deleted successfully",
        badges,
      });
    } catch (error) {
      console.error("Error while soft-deleting the badge:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
};
