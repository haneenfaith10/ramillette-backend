const Tax = require("../models/taxModel");

module.exports = {
  // function to update or add the tax value based on country
  updateTaxForCountry: async (req, res) => {
    try {
      const { countryId } = req.params;
      const { taxPercentage, taxName } = req.body;
      if (typeof taxPercentage !== "number")
        return res.status(400).json({ error: "Tax must be a number" });
      let tax = await Tax.findOne({ country: countryId });
      if (tax) {
        tax.taxPercentage = taxPercentage;
        tax.taxName = taxName;
        await tax.save();
      } else {
        tax = await Tax.create({ country: countryId, taxPercentage, taxName });
      }
      res.status(200).json({ isSuccess: true, message: "Tax updated", tax });
    } catch (error) {
      console.error("Error updating tax:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
  //   function to get the country tax
  getTaxByCountry: async (req, res) => {
    try {
      const { countryId } = req.params;
      const tax = await Tax.findOne({ country: countryId });
      if (!tax) {
        return res.status(200).json({
          isSuccess: true,
          message: "Successfully fetched country tax!",
          tax: {
            taxPercentage: "",
            country: "IN",
          },
        });
      }
      res.status(200).json({
        isSuccess: true,
        message: "Successfully fetched country tax!",
        tax,
      });
    } catch (error) {
      console.error("Error while getting country tax:", error);
      res.status(500).json({ error: "Server error" });
    }
  },
};
