const Country = require("../models/countryModel");
const fs = require("fs");
const path = require("path");
const Product = require("../models/productModel");

module.exports = {
  getallCountries: async (req, res) => {
    try {
      const countries = await Country.find().sort({ name: 1 });
      res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched country list",
        countries,
      });
    } catch (error) {
      console.error("Error while getting all county details:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  postCountryDetails: async (req, res) => {
    try {
      const { name, code, currency, priceLabel } = req.body;

      const exists = await Country.findOne({ code });
      if (exists) {
        return res.status(400).json({ message: "Country already exists" });
      }

      let flagUrl = null;
      if (req.file) {
        flagUrl = `/uploads/flags/${req.file.filename}`;
      }

      const country = new Country({
        name,
        code,
        currency,
        flagUrl,
        priceLabel,
      });

      await country.save();

      res.status(200).json({
        isSuccess: true,
        message: "Country created successfully",
        country,
      });
    } catch (error) {
      console.error("Error while posting country details:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  updateCountry: async (req, res) => {
    try {
      const { name, code, currency, isActive, priceLabel } = req.body;
      const countryId = req.params.id;

      // Build update object
      const updateData = { name, code, currency, priceLabel };
      if (typeof isActive !== "undefined") {
        updateData.isActive = isActive;
      }

      if (req.file) {
        updateData.flagUrl = `/uploads/flags/${req.file.filename}`;

        const existingCountry = await Country.findById(countryId);
        if (existingCountry?.flagUrl) {
          const oldFilePath = path.join(
            __dirname,
            "..",
            existingCountry.flagUrl
          );
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
      }

      const country = await Country.findByIdAndUpdate(countryId, updateData, {
        new: true,
      });

      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }

      return res.status(200).json({
        isSuccess: true,
        message: "Successfully updated country details",
        country,
      });
    } catch (error) {
      console.error("Error while updating country details:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  },
  deleteCountry: async (req, res) => {
    try {
      await Country.findByIdAndDelete(req.params.id);
      res.status(200).json({ isSuccess: true, message: "Country deleted" });
    } catch (error) {
      console.error("Error while deleting country details:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  },
  toggleCountryStatus: async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    try {
      const country = await Country.findByIdAndUpdate(
        id,
        { isActive },
        { new: true }
      );
      if (!country) {
        return res.status(404).json({ message: "Country not found" });
      }
      res.json({ message: "Status updated", country });
    } catch (error) {
      console.error("Toggle error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  // function to get active countries for users
  getActiveCountries: async (req, res) => {
    try {
      const countries = await Country.find({ isActive: true }).sort({
        name: 1,
      });
      res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched country list",
        countries,
      });
    } catch (error) {
      console.error("Error while fetching active countries:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
  // function to change the primary country
  setPrimary: async (req, res) => {
    try {
      const countryId = req.params.id;
      const selectedCountry = await Country.findById(countryId);

      if (!selectedCountry) {
        return res
          .status(404)
          .json({ success: false, message: "Country not found." });
      }

      // Step 2: If the selected country is already primary, do nothing
      if (selectedCountry.isPrimary) {
        return res.status(200).json({
          IsSuccess: true,
          message: "Country is already primary.",
        });
      }

      // Step 3: Unset the current primary country (if any)
      await Country.updateOne({ isPrimary: true }, { isPrimary: false });

      // Step 4: Set the selected country as primary
      selectedCountry.isPrimary = true;
      await selectedCountry.save();

      return res.status(200).json({
        isSuccess: true,
        message: "Primary country updated.",
        country: selectedCountry,
      });
    } catch (error) {
      console.error("Error setting primary country:", error);
      return res.status(500).json({ success: false, message: "Server error." });
    }
  },
  // function to get the country related product
  getCountryBasedProducts: async (req, res) => {
    try {
      let selectedcountries = req.headers.selectedcountries;

      // Parse from string to array
      if (selectedcountries) {
        selectedcountries = JSON.parse(selectedcountries);
      }

      let query = {
        status: true,
        isDelete: false,
      };

      if (Array.isArray(selectedcountries) && selectedcountries.length > 0) {
        const countryIds = selectedcountries.map((country) => country.value);
        query.countries = { $in: countryIds };
      }
      
      const products = await Product.find(query);

      return res.status(200).json({
        isSuccess: true,
        message: "Fetched products based on selected countries",
        products,
      });
    } catch (error) {
      console.error("Error while getting the country related products:", error);
      return res.status(500).json({ success: false, message: "Server error." });
    }
  },
};
