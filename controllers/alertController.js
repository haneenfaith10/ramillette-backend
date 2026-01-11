const Country = require("../models/countryModel");
const CollectionAlert = require("../models/collectionAlertModel");
const mongoose = require("mongoose");

module.exports = {
  // function to create new collection alert
  createAlert: async (req, res) => {
    try {
      const { countryId, content } = req.body;
      if (!countryId || !content) {
        return res.status(400).json({
          isSuccess: false,
          message: "Country ID and content are required.",
        });
      }
      const country = await Country.findById(countryId);
      if (!country) {
        return res.status(404).json({
          isSuccess: false,
          message: "Country not found.",
        });
      }
      const newAlert = await CollectionAlert.create({
        country: countryId,
        content,
      });

      return res.status(200).json({
        isSuccess: true,
        message: "Collection alert created successfully.",
        alert: newAlert,
      });
    } catch (error) {
      console.log("Error while creating new collection alert", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal Server Error",
      });
    }
  },
  //   function to fetch the collection alert based on the country
  getCountryAlert: async (req, res) => {
    try {
      const { countryId } = req.params;
      console.log(req.params, "countryIdsiadfkhn");
      if (!countryId) {
        return res.status(400).json({
          isSuccess: false,
          message: "Country ID is required",
        });
      }

      const alerts = await CollectionAlert.find({
        country: new mongoose.Types.ObjectId(countryId),
      }).sort({ createdAt: -1 });

      return res.status(200).json({
        isSuccess: true,
        message: "Collection alerts fetched successfully",
        alerts,
      });
    } catch (error) {
      console.log("Error while fetching the alert based on country", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal Server Error",
      });
    }
  },
  //   function to update the collection alert
  updateCollectionAlert: async (req, res) => {
    try {
      const { content, alertId } = req.body;

      if (!mongoose.Types.ObjectId.isValid(alertId)) {
        return res.status(400).json({
          isSuccess: false,
          message: "Invalid alert ID",
        });
      }

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          isSuccess: false,
          message: "Alert content is required",
        });
      }
      const updatedAlert = await CollectionAlert.findByIdAndUpdate(
        alertId,
        { content },
        { new: true }
      );
      if (!updatedAlert) {
        return res.status(404).json({
          isSuccess: false,
          message: "Alert not found",
        });
      }

      res.status(200).json({
        isSuccess: true,
        message: "Collection alert updated successfully",
        alert: updatedAlert,
      });
    } catch (error) {
      console.log("Error while updating the collection alert", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal Server Error",
      });
    }
  },
  //   function to delete the collection alert
  deleteCollectionAlert: async (req, res) => {
    try {
      const { alertId } = req.params;

      // Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(alertId)) {
        return res.status(400).json({
          isSuccess: false,
          message: "Invalid alert ID",
        });
      }

      const deletedAlert = await CollectionAlert.findByIdAndDelete(alertId);

      if (!deletedAlert) {
        return res.status(404).json({
          isSuccess: false,
          message: "Alert not found",
        });
      }

      return res.status(200).json({
        isSuccess: true,
        message: "Collection alert deleted successfully",
      });
    } catch (error) {
      console.log("Error while deleting the collection alert", error);
      res.status(500).json({
        isSuccess: false,
        message: "Internal Server Error",
      });
    }
  },
};
