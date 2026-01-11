const Provider = require("../models/shippingProvider");

module.exports = {
  createProvider: async (req, res) => {
    try {
      const { providerName } = req.body;

      if (!providerName) {
        return res.status(400).json({
          isSuccess: false,
          message: "Missing provider name",
        });
      }

      const provider = await Provider.create({ providerName });

      return res.status(200).json({
        isSuccess: true,
        message: "Provider created successfully",
        provider,
      });
    } catch (error) {
      console.error("Error while creating new provider:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal server error.",
      });
    }
  },
  getAllActiveProviders: async (req, res) => {
    try {
      const providers = await Provider.find({ status: true });
      res.status(200).json({
        isSuccess: true,
        message: "Fetched all active shipping providers",
        providers,
      });
    } catch (error) {
      console.error("Error while getting all active providers:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal server error.",
      });
    }
  },
  getAllProviders: async (req, res) => {
    try {
      const providers = await Provider.find().sort({ createdAt: -1 });
      res.status(200).json({
        isSuccess: true,
        message: "Fetched all active shipping providers",
        providers,
      });
    } catch (error) {
      console.error("Error while getting all  providers:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal server error.",
      });
    }
  },
  deleteProvider: async (req, res) => {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          isSuccess: false,
          message: "Missing provider ID.",
        });
      }

      const deleted = await Provider.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({
          isSuccess: false,
          message: "Provider not found.",
        });
      }

      res.status(200).json({
        isSuccess: true,
        message: "Provider deleted successfully.",
      });
    } catch (error) {
      console.error("Error while deleting Provider:", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal server error.",
      });
    }
  },
  updateProvider: async (req, res) => {
    try {
      const { id } = req.params;
      const { providerName } = req.body;

      if (!id || !providerName) {
        return res.status(404).json({
          message: "Some fields are missing (id,providerName) !",
          isSuccess: false,
        });
      }

      const updated = await Provider.findByIdAndUpdate(
        id,
        { providerName },
        { new: true }
      );

      if (!updated) {
        return res.status(404).json({
          isSuccess: false,
          message: "Provider not found",
        });
      }

      res.status(200).json({
        isSuccess: true,
        message: "Updated shipping provider details!",
        updated,
      });
    } catch (error) {
      console.error("Update provider error:", error);
      res.status(500).json({ isSuccess: false, message: "Server error" });
    }
  },
};
